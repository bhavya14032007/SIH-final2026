"""
SANRAKSHAK - Adaptive Training Controller
Orchestrates the ML training loop with Gemini-assisted experiment optimization.

Flow:
1. Load & validate dataset
2. Preprocess features
3. Train baseline models (LR, RF, GB)
4. Evaluate with stratified k-fold CV
5. Send metrics to Gemini for analysis
6. Gemini recommends next experiment
7. Execute recommendation
8. Repeat until convergence or MAX_EXPERIMENTS
9. Select best model (primary metric: F1)
10. Save model + metadata

MAX_EXPERIMENTS = 10 (prevents infinite retraining)
"""

import os
import json
import joblib
import numpy as np
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier

from config import Config
from ml.preprocess import DataPreprocessor
from ml.evaluate import ModelEvaluator


class TrainingController:
    """Adaptive ML training controller with experiment tracking."""

    MAX_EXPERIMENTS = 10

    # Safe model registry — Gemini can only choose from these
    MODEL_REGISTRY = {
        'LogisticRegression': LogisticRegression,
        'RandomForestClassifier': RandomForestClassifier,
        'GradientBoostingClassifier': GradientBoostingClassifier,
        'HistGradientBoostingClassifier': HistGradientBoostingClassifier,
    }

    # Safe hyperparameter ranges
    SAFE_PARAMS = {
        'n_estimators': range(50, 501),
        'max_depth': list(range(2, 21)) + [None],
        'min_samples_leaf': range(1, 21),
        'min_samples_split': range(2, 21),
        'learning_rate': [0.01, 0.05, 0.1, 0.2, 0.3],
        'C': [0.01, 0.1, 1.0, 10.0, 100.0],
        'max_iter': range(100, 2001),
    }

    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.evaluator = ModelEvaluator(n_folds=5)
        self.experiments = []
        self.best_experiment = None

        os.makedirs(Config.EXPERIMENTS_DIR, exist_ok=True)

    def run(self):
        """Execute the full adaptive training pipeline."""
        print("\n" + "=" * 60)
        print("  SANRAKSHAK ML Training Pipeline")
        print("  Gemini-Assisted Adaptive Training Orchestrator")
        print("=" * 60)

        # Step 1: Find dataset
        dataset_path = self._find_dataset()
        if not dataset_path:
            return {'error': 'No dataset found', 'status': 'failed'}

        # Step 2: Load and validate
        try:
            df, validation_report = self.preprocessor.load_and_validate(dataset_path)
        except (FileNotFoundError, ValueError) as e:
            return {'error': str(e), 'status': 'failed'}

        # Step 3: Prepare features
        X, y = self.preprocessor.prepare_features(df)

        dataset_summary = {
            'n_samples': len(df),
            'n_features': X.shape[1],
            'feature_names': self.preprocessor.feature_names,
            'target_name': self.preprocessor.target_name,
            'n_classes': len(np.unique(y)),
            'class_distribution': validation_report.get('target_distribution', {}),
            'warnings': validation_report.get('warnings', []),
        }

        print(f"\n[Training] Dataset: {dataset_summary['n_samples']} samples, "
              f"{dataset_summary['n_features']} features, "
              f"{dataset_summary['n_classes']} classes")

        # Step 4: Baseline experiments
        print("\n--- Baseline Experiments ---")
        baselines = {
            'LogisticRegression': LogisticRegression(
                max_iter=1000, random_state=42
            ),
            'RandomForestClassifier': RandomForestClassifier(
                n_estimators=100, max_depth=None, random_state=42
            ),
            'GradientBoostingClassifier': GradientBoostingClassifier(
                n_estimators=100, max_depth=3, random_state=42
            ),
        }

        for name, model in baselines.items():
            metrics = self.evaluator.evaluate(model, X, y, model_name=name)
            self._save_experiment(metrics, {'default': True})

        # Step 5: Adaptive training loop
        print("\n--- Adaptive Training Loop ---")
        for iteration in range(self.MAX_EXPERIMENTS - len(self.experiments)):
            if len(self.experiments) >= self.MAX_EXPERIMENTS:
                print(f"[Training] MAX_EXPERIMENTS ({self.MAX_EXPERIMENTS}) reached.")
                break

            # Get Gemini recommendation (or fallback)
            recommendation = self._get_recommendation(dataset_summary)

            if not recommendation.get('continue_training', False):
                print(f"[Training] Stopping: {recommendation.get('reasoning', 'convergence')}")
                break

            # Execute recommended experiment
            next_model_name = recommendation.get('next_model', 'RandomForestClassifier')
            next_params = self._sanitize_params(
                next_model_name,
                recommendation.get('hyperparameters', {})
            )

            print(f"\n[Training] Experiment {len(self.experiments) + 1}: "
                  f"{next_model_name} with {next_params}")

            try:
                ModelClass = self.MODEL_REGISTRY.get(
                    next_model_name, RandomForestClassifier
                )
                model = ModelClass(random_state=42, **next_params)
                metrics = self.evaluator.evaluate(model, X, y, model_name=next_model_name)
                self._save_experiment(metrics, next_params)
            except Exception as e:
                print(f"[Training] Experiment failed: {e}")
                continue

        # Step 6: Select best model
        self.best_experiment = self._select_best()
        if not self.best_experiment:
            return {'error': 'No successful experiments', 'status': 'failed'}

        # Step 7: Train final model and save
        final_result = self._train_and_save_final(X, y)

        print("\n" + "=" * 60)
        print(f"  Training Complete!")
        print(f"  Best Model: {self.best_experiment['model_name']}")
        print(f"  CV F1: {self.best_experiment['cv_f1']:.4f}")
        print(f"  Total Experiments: {len(self.experiments)}")
        print("=" * 60)

        return final_result

    def _find_dataset(self):
        """Find the dataset file (raw first, then synthetic)."""
        # Check for real data first
        raw_dir = Config.RAW_DATA_DIR
        if os.path.exists(raw_dir):
            for f in os.listdir(raw_dir):
                if f.endswith('.csv'):
                    return os.path.join(raw_dir, f)

        # Check synthetic data
        synthetic_dir = Config.SYNTHETIC_DATA_DIR
        synthetic_file = os.path.join(synthetic_dir, 'industrial_hazard_data.csv')
        if os.path.exists(synthetic_file):
            return synthetic_file

        # Generate synthetic data
        print("[Training] No dataset found. Generating synthetic data...")
        from ml.generate_data import generate_dataset
        return generate_dataset(synthetic_file)

    def _save_experiment(self, metrics, params):
        """Save experiment results to JSON log."""
        run_id = len(self.experiments) + 1
        experiment = {
            'run_id': run_id,
            'model_name': metrics['model_name'],
            'parameters': params,
            'cv_f1': metrics['cv_f1'],
            'cv_f1_std': metrics['cv_f1_std'],
            'cv_accuracy': metrics['cv_accuracy'],
            'cv_precision': metrics['cv_precision'],
            'cv_recall': metrics['cv_recall'],
            'train_f1': metrics['train_f1'],
            'train_accuracy': metrics['train_accuracy'],
            'train_val_gap': metrics['train_val_gap'],
            'roc_auc': metrics.get('roc_auc'),
            'diagnosis': metrics['diagnosis'],
            'confusion_matrix': metrics['confusion_matrix'],
            'n_folds': metrics['n_folds'],
            'fold_scores': metrics.get('fold_scores', {}),
            'timestamp': datetime.now().isoformat()
        }

        self.experiments.append(experiment)

        # Save to file
        filename = f"run_{run_id:03d}.json"
        filepath = os.path.join(Config.EXPERIMENTS_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(experiment, f, indent=2)

        return experiment

    def _get_recommendation(self, dataset_summary):
        """Get next experiment recommendation from Gemini or fallback."""
        try:
            from services.gemini_service import gemini_service

            context = {
                'dataset_summary': dataset_summary,
                'experiment_history': self.experiments,
                'current_metrics': self.experiments[-1] if self.experiments else {},
            }

            return gemini_service.analyze_training(context)
        except Exception as e:
            print(f"[Training] Gemini unavailable: {e}. Using fallback.")
            return self._fallback_recommendation()

    def _fallback_recommendation(self):
        """Simple rule-based recommendation when Gemini is unavailable."""
        if not self.experiments:
            return {'continue_training': True, 'next_model': 'RandomForestClassifier',
                    'hyperparameters': {}, 'reasoning': 'No experiments yet'}

        last = self.experiments[-1]
        best = self._select_best()

        if best and best['cv_f1'] >= 0.80:
            return {'continue_training': False, 'reasoning': 'Good performance achieved'}

        if last['diagnosis'] == 'possible_overfitting':
            return {
                'continue_training': True,
                'next_model': 'RandomForestClassifier',
                'hyperparameters': {'max_depth': 5, 'min_samples_leaf': 4, 'n_estimators': 150},
                'reasoning': 'Reducing complexity to address overfitting'
            }

        if last['diagnosis'] == 'possible_underfitting':
            return {
                'continue_training': True,
                'next_model': 'GradientBoostingClassifier',
                'hyperparameters': {'n_estimators': 200, 'max_depth': 5, 'learning_rate': 0.1},
                'reasoning': 'Increasing complexity to address underfitting'
            }

        # Try different hyperparameters
        tried_models = set(e['model_name'] for e in self.experiments)
        if 'HistGradientBoostingClassifier' not in tried_models:
            return {
                'continue_training': True,
                'next_model': 'HistGradientBoostingClassifier',
                'hyperparameters': {'max_depth': 5, 'max_iter': 200},
                'reasoning': 'Trying HistGradientBoosting'
            }

        return {'continue_training': False, 'reasoning': 'Explored sufficient models'}

    def _sanitize_params(self, model_name, params):
        """Validate hyperparameters against safe ranges."""
        safe = {}
        for key, value in params.items():
            if key in self.SAFE_PARAMS:
                valid_range = self.SAFE_PARAMS[key]
                if isinstance(valid_range, range):
                    value = max(valid_range.start, min(valid_range.stop - 1, int(value)))
                elif isinstance(valid_range, list):
                    if value not in valid_range:
                        # Pick closest
                        value = min(valid_range, key=lambda x: abs((x or 0) - (value or 0)))
                safe[key] = value
            # Skip unknown parameters for safety

        return safe

    def _select_best(self):
        """Select best model based on CV F1 score with preference for simpler models."""
        if not self.experiments:
            return None

        # Sort by CV F1 (descending), then by model simplicity
        complexity = {
            'LogisticRegression': 1,
            'RandomForestClassifier': 2,
            'GradientBoostingClassifier': 3,
            'HistGradientBoostingClassifier': 3,
        }

        sorted_exps = sorted(
            self.experiments,
            key=lambda e: (
                -e['cv_f1'],
                complexity.get(e['model_name'], 5),
                e['cv_f1_std']
            )
        )

        best = sorted_exps[0]

        # If top two are within 0.02 F1, prefer simpler
        if len(sorted_exps) > 1:
            second = sorted_exps[1]
            if (best['cv_f1'] - second['cv_f1']) < 0.02:
                if complexity.get(second['model_name'], 5) < complexity.get(best['model_name'], 5):
                    best = second

        return best

    def _train_and_save_final(self, X, y):
        """Train the best model on full data and save."""
        best = self.best_experiment
        model_name = best['model_name']
        params = best.get('parameters', {})

        # Remove non-model params
        params = {k: v for k, v in params.items()
                  if k not in ['default'] and v is not None}

        ModelClass = self.MODEL_REGISTRY.get(model_name, RandomForestClassifier)
        final_model = ModelClass(random_state=42, **params)
        final_model.fit(X, y)

        # Save model
        joblib.dump(final_model, Config.MODEL_PATH)

        # Feature importance
        importance = {}
        if hasattr(final_model, 'feature_importances_'):
            for fname, imp in zip(self.preprocessor.feature_names, final_model.feature_importances_):
                importance[fname] = round(float(imp), 4)

        # Save metadata
        metadata = {
            'version': f'v{len(self.experiments)}',
            'model_type': model_name,
            'feature_names': self.preprocessor.feature_names,
            'target_classes': list(self.preprocessor.label_encoder.classes_),
            'training_date': datetime.now().isoformat(),
            'cv_f1': best['cv_f1'],
            'cv_f1_std': best['cv_f1_std'],
            'cv_accuracy': best['cv_accuracy'],
            'cv_precision': best['cv_precision'],
            'cv_recall': best['cv_recall'],
            'train_f1': best['train_f1'],
            'roc_auc': best.get('roc_auc'),
            'hyperparameters': params,
            'total_experiments': len(self.experiments),
            'feature_importance': importance,
            'diagnosis': best['diagnosis'],
            'n_samples': X.shape[0],
            'n_features': X.shape[1],
        }

        with open(Config.MODEL_METADATA_PATH, 'w') as f:
            json.dump(metadata, f, indent=2)

        # Save preprocessor
        preprocessor_path = os.path.join(os.path.dirname(Config.MODEL_PATH), 'preprocessor.pkl')
        joblib.dump(self.preprocessor, preprocessor_path)

        print(f"[Training] Model saved to {Config.MODEL_PATH}")
        print(f"[Training] Metadata saved to {Config.MODEL_METADATA_PATH}")

        return {
            'status': 'success',
            'model': model_name,
            'version': metadata['version'],
            'cv_f1': best['cv_f1'],
            'cv_accuracy': best['cv_accuracy'],
            'total_experiments': len(self.experiments),
            'all_experiments': self.experiments,
            'metadata': metadata,
        }


if __name__ == '__main__':
    controller = TrainingController()
    result = controller.run()
    print(json.dumps(result, indent=2, default=str))
