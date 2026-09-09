"""
SANRAKSHAK - Gemini AI Service
Handles two roles:
1. Training Orchestrator: Analyzes experiments and recommends next training steps
2. Production Explainer: Generates human-readable explanations of predictions

Gemini is an enhancement, NOT a single point of failure.
The system works without Gemini using rule-based fallbacks.
"""

import json
import os
from config import Config

# Try to import Gemini SDK
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("[GeminiService] google-generativeai not installed. Using fallback mode.")


class GeminiService:
    """Gemini AI integration for intelligent decision support."""

    def __init__(self):
        self.available = False
        self.model = None

        if GEMINI_AVAILABLE and Config.GEMINI_API_KEY:
            try:
                genai.configure(api_key=Config.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                self.available = True
                print("[GeminiService] Gemini API initialized successfully.")
            except Exception as e:
                print(f"[GeminiService] Gemini initialization failed: {e}")
        else:
            print("[GeminiService] No API key configured. Using fallback explanations.")

    # =========================================================
    # TRAINING ORCHESTRATOR
    # =========================================================

    def analyze_training(self, context):
        """
        Gemini acts as an intelligent training orchestrator.
        It does NOT perform actual numerical training — Python/scikit-learn does that.
        Gemini analyzes metrics and recommends the next experiment.

        Args:
            context: dict containing dataset_summary, experiment_history, current_metrics

        Returns:
            dict with diagnosis and next experiment recommendation (structured JSON)
        """
        if not self.available:
            return self._fallback_training_recommendation(context)

        prompt = f"""You are SANRAKSHAK's ML Training Orchestrator. You analyze model training results
and recommend the next experiment. You do NOT perform training — Python/scikit-learn does that.

DATASET SUMMARY:
{json.dumps(context.get('dataset_summary', {}), indent=2)}

EXPERIMENT HISTORY:
{json.dumps(context.get('experiment_history', []), indent=2)}

CURRENT METRICS:
{json.dumps(context.get('current_metrics', {}), indent=2)}

Analyze the results and return ONLY valid JSON with this exact structure:
{{
  "diagnosis": "one of: acceptable_generalization, possible_overfitting, possible_underfitting, needs_more_data, class_imbalance_issue",
  "confidence": 0.0 to 1.0,
  "recommendation": "one of: reduce_model_complexity, increase_model_complexity, try_different_model, adjust_features, tune_hyperparameters, accept_current_model",
  "next_model": "one of: LogisticRegression, RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier",
  "hyperparameters": {{}},
  "feature_action": "one of: keep_current_features, add_derived_features, remove_low_importance_features",
  "continue_training": true or false,
  "reasoning": "brief explanation"
}}

RULES:
- Primary metric is F1-score (safety systems need good recall)
- Flag overfitting if train_f1 - cv_f1 > 0.15
- Flag underfitting if both train_f1 and cv_f1 are below 0.65
- Prefer simpler models when performance is similar
- Do NOT recommend deep learning for 150 rows
- Be conservative — small datasets need regularization"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Extract JSON from possible markdown code blocks
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()

            result = json.loads(text)
            return self._validate_training_response(result)
        except Exception as e:
            print(f"[GeminiService] Training analysis error: {e}")
            return self._fallback_training_recommendation(context)

    def _validate_training_response(self, result):
        """Validate and sanitize Gemini's training recommendation."""
        valid_models = ['LogisticRegression', 'RandomForestClassifier',
                        'GradientBoostingClassifier', 'HistGradientBoostingClassifier']
        valid_diagnoses = ['acceptable_generalization', 'possible_overfitting',
                           'possible_underfitting', 'needs_more_data', 'class_imbalance_issue']

        # Sanitize model name
        if result.get('next_model') not in valid_models:
            result['next_model'] = 'RandomForestClassifier'

        # Sanitize diagnosis
        if result.get('diagnosis') not in valid_diagnoses:
            result['diagnosis'] = 'acceptable_generalization'

        # Ensure continue_training is boolean
        result['continue_training'] = bool(result.get('continue_training', False))

        return result

    def _fallback_training_recommendation(self, context):
        """Rule-based training recommendation when Gemini is unavailable."""
        metrics = context.get('current_metrics', {})
        train_f1 = metrics.get('train_f1', 0)
        cv_f1 = metrics.get('cv_f1', 0)
        cv_std = metrics.get('cv_std', 0)

        if train_f1 - cv_f1 > 0.15:
            diagnosis = 'possible_overfitting'
            recommendation = 'reduce_model_complexity'
            hyperparameters = {'max_depth': 5, 'min_samples_leaf': 4, 'n_estimators': 100}
        elif cv_f1 < 0.65:
            diagnosis = 'possible_underfitting'
            recommendation = 'increase_model_complexity'
            hyperparameters = {'n_estimators': 200, 'max_depth': 10}
        else:
            diagnosis = 'acceptable_generalization'
            recommendation = 'accept_current_model'
            hyperparameters = {}

        return {
            'diagnosis': diagnosis,
            'confidence': 0.70,
            'recommendation': recommendation,
            'next_model': 'RandomForestClassifier',
            'hyperparameters': hyperparameters,
            'feature_action': 'keep_current_features',
            'continue_training': cv_f1 < 0.70,
            'reasoning': f'Fallback analysis: train_f1={train_f1:.2f}, cv_f1={cv_f1:.2f}, cv_std={cv_std:.3f}'
        }

    # =========================================================
    # PRODUCTION EXPLAINER
    # =========================================================

    def explain_prediction(self, prediction_context):
        """
        Generate human-readable explanation of a risk prediction.
        Called on-demand, NOT for every sensor reading.

        Args:
            prediction_context: dict with risk_score, hazard_type, sensor values, etc.

        Returns:
            dict with summary, contributing_factors, recommended_actions
        """
        if not self.available:
            return self._fallback_explanation(prediction_context)

        prompt = f"""You are SANRAKSHAK's AI Safety Advisor. Generate a clear, actionable explanation
for industrial safety operators based on these prediction results:

PREDICTION DATA:
{json.dumps(prediction_context, indent=2)}

Return ONLY valid JSON with this structure:
{{
  "severity": "CRITICAL or HIGH or ELEVATED or MODERATE or LOW",
  "summary": "2-3 sentence plain-language summary of the situation",
  "contributing_factors": ["factor 1 with specific values", "factor 2", ...],
  "recommended_actions": ["specific action 1", "specific action 2", ...],
  "operator_message": "direct message to the plant operator",
  "technical_detail": "brief technical explanation for engineers"
}}

RULES:
- Be specific — reference actual sensor values
- Recommend concrete, actionable steps
- Do NOT recommend shutting down unless severity is CRITICAL
- Keep language professional but clear
- Maximum 5 recommended actions
- Maximum 5 contributing factors"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()

            return json.loads(text)
        except Exception as e:
            print(f"[GeminiService] Explanation error: {e}")
            return self._fallback_explanation(prediction_context)

    def _fallback_explanation(self, ctx):
        """Rule-based explanation when Gemini is unavailable."""
        risk = ctx.get('risk_score', 0)
        hazard = ctx.get('hazard_type', 'Unknown Hazard')
        gas = ctx.get('gas_ppm', 0)
        temp = ctx.get('temperature', 0)
        pressure = ctx.get('pressure', 0)

        if risk >= 80:
            severity = 'CRITICAL'
        elif risk >= 60:
            severity = 'HIGH'
        elif risk >= 40:
            severity = 'ELEVATED'
        else:
            severity = 'MODERATE'

        factors = []
        actions = []

        if gas > 300:
            factors.append(f"Gas concentration elevated at {gas} ppm (threshold: 300 ppm)")
            actions.append("Inspect gas detection sensors in Sector 4")
        if temp > 60:
            factors.append(f"Temperature elevated at {temp}°C (threshold: 60°C)")
            actions.append("Check cooling systems")
        if pressure > 7:
            factors.append(f"Pressure instability detected at {pressure} bar")
            actions.append("Monitor pressure vessel integrity")

        wind_dir = ctx.get('wind_direction', 315)
        if abs(wind_dir - 135) < 60:
            factors.append(f"Wind direction ({wind_dir}°) heading toward populated zones")
            actions.append("Prepare downwind zone evacuation plans")

        if risk >= 80:
            actions.append("Activate emergency response team")
            actions.append("Notify local authorities")

        return {
            'severity': severity,
            'summary': f'{hazard} detected with risk score {risk}/100. '
                       f'Multiple sensor parameters are exceeding safe thresholds. '
                       f'Immediate monitoring and response preparation recommended.',
            'contributing_factors': factors or ['Multiple parameters approaching thresholds'],
            'recommended_actions': actions or ['Continue monitoring sensor readings'],
            'operator_message': f'ATTENTION: {severity} risk level detected. '
                                f'{hazard}. Risk score: {risk}/100. '
                                f'Review sensor dashboard and follow emergency protocols.',
            'technical_detail': f'Rule-based analysis (AI explanation temporarily unavailable). '
                                f'Gas: {gas} ppm, Temp: {temp}°C, Pressure: {pressure} bar.'
        }


# Global instance
gemini_service = GeminiService()
