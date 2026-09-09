"""
SANRAKSHAK - Model Evaluation Module
Computes cross-validation metrics with overfitting/underfitting detection.
"""

import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)


class ModelEvaluator:
    """Evaluates ML models using stratified k-fold cross-validation."""

    def __init__(self, n_folds=5):
        self.n_folds = n_folds

    def evaluate(self, model, X, y, model_name='Model'):
        """
        Perform stratified k-fold cross-validation and compute all metrics.

        Args:
            model: sklearn estimator
            X: feature matrix
            y: target vector
            model_name: name for logging

        Returns:
            dict with comprehensive metrics
        """
        # Check if stratification is possible
        unique, counts = np.unique(y, return_counts=True)
        min_class_count = min(counts)

        if min_class_count < self.n_folds:
            # Fall back to fewer folds
            actual_folds = max(2, min_class_count)
            print(f"[Evaluator] WARNING: Smallest class has {min_class_count} samples. "
                  f"Reducing from {self.n_folds} to {actual_folds} folds.")
        else:
            actual_folds = self.n_folds

        cv = StratifiedKFold(n_splits=actual_folds, shuffle=True, random_state=42)

        # Cross-validation scoring
        scoring = {
            'accuracy': 'accuracy',
            'precision_weighted': 'precision_weighted',
            'recall_weighted': 'recall_weighted',
            'f1_weighted': 'f1_weighted',
        }

        cv_results = cross_validate(
            model, X, y, cv=cv, scoring=scoring,
            return_train_score=True, n_jobs=-1
        )

        # Training score on full data
        model.fit(X, y)
        y_pred = model.predict(X)
        train_f1 = f1_score(y, y_pred, average='weighted')
        train_accuracy = accuracy_score(y, y_pred)

        # Cross-validation averages
        cv_f1 = np.mean(cv_results['test_f1_weighted'])
        cv_f1_std = np.std(cv_results['test_f1_weighted'])
        cv_accuracy = np.mean(cv_results['test_accuracy'])
        cv_precision = np.mean(cv_results['test_precision_weighted'])
        cv_recall = np.mean(cv_results['test_recall_weighted'])

        # ROC-AUC (if model supports predict_proba)
        roc_auc = None
        if hasattr(model, 'predict_proba') and len(unique) > 2:
            try:
                y_proba = model.predict_proba(X)
                roc_auc = roc_auc_score(y, y_proba, multi_class='ovr', average='weighted')
            except Exception:
                pass
        elif hasattr(model, 'predict_proba') and len(unique) == 2:
            try:
                y_proba = model.predict_proba(X)[:, 1]
                roc_auc = roc_auc_score(y, y_proba)
            except Exception:
                pass

        # Confusion matrix
        cm = confusion_matrix(y, y_pred).tolist()

        # Overfitting / Underfitting diagnosis
        train_val_gap = train_f1 - cv_f1
        diagnosis = self._diagnose(train_f1, cv_f1, cv_f1_std)

        metrics = {
            'model_name': model_name,
            'n_folds': actual_folds,
            'train_accuracy': round(train_accuracy, 4),
            'train_f1': round(train_f1, 4),
            'cv_accuracy': round(cv_accuracy, 4),
            'cv_accuracy_std': round(np.std(cv_results['test_accuracy']), 4),
            'cv_precision': round(cv_precision, 4),
            'cv_recall': round(cv_recall, 4),
            'cv_f1': round(cv_f1, 4),
            'cv_f1_std': round(cv_f1_std, 4),
            'roc_auc': round(roc_auc, 4) if roc_auc is not None else None,
            'train_val_gap': round(train_val_gap, 4),
            'confusion_matrix': cm,
            'diagnosis': diagnosis,
            'fold_scores': {
                'f1': [round(s, 4) for s in cv_results['test_f1_weighted']],
                'accuracy': [round(s, 4) for s in cv_results['test_accuracy']],
            }
        }

        print(f"[Evaluator] {model_name}: CV F1={cv_f1:.4f}±{cv_f1_std:.4f}, "
              f"Train F1={train_f1:.4f}, Gap={train_val_gap:.4f} → {diagnosis}")

        return metrics

    def _diagnose(self, train_f1, cv_f1, cv_std):
        """Detect overfitting, underfitting, or acceptable generalization."""
        gap = train_f1 - cv_f1

        if gap > 0.15:
            return 'possible_overfitting'
        elif train_f1 < 0.65 and cv_f1 < 0.65:
            return 'possible_underfitting'
        elif cv_std > 0.15:
            return 'high_variance'
        elif cv_f1 >= 0.70:
            return 'acceptable_generalization'
        else:
            return 'needs_improvement'
