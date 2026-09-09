"""
SANRAKSHAK - Multi-Factor Risk Engine
Combines ML model predictions with deterministic safety rules
and environmental conditions for comprehensive risk assessment.
"""

import os
import json
import joblib
import numpy as np
from datetime import datetime
from config import Config


class RiskEngine:
    """
    Combines ML prediction output with rule-based risk amplification.
    The ML model handles learned pattern recognition.
    The deterministic rules handle known safety thresholds.
    """

    # Safety thresholds (clearly defined, not hidden)
    THRESHOLDS = {
        'gas_ppm': {'warning': 300, 'critical': 450},
        'temperature': {'warning': 60, 'critical': 85},
        'pressure': {'warning': 7.0, 'critical': 9.0},
        'humidity': {'warning': 70, 'critical': 85},
        'wind_speed': {'warning': 15, 'critical': 25},
        'vibration': {'warning': 10, 'critical': 18},
        'air_quality': {'warning': 150, 'critical': 300},
    }

    # Hazard type mapping
    HAZARD_TYPES = {
        0: 'Low Risk - Normal Operations',
        1: 'Moderate Risk - Monitor Closely',
        2: 'Chemical Leak Escalation',
        3: 'Critical Hazard - Immediate Action Required',
    }

    def __init__(self):
        self.model = None
        self.model_metadata = None
        self._load_model()

    def _load_model(self):
        """Load the trained ML model if available."""
        try:
            if os.path.exists(Config.MODEL_PATH):
                self.model = joblib.load(Config.MODEL_PATH)
                with open(Config.MODEL_METADATA_PATH, 'r') as f:
                    self.model_metadata = json.load(f)
                print("[RiskEngine] ML model loaded successfully.")
            else:
                print("[RiskEngine] No trained model found. Using rule-based scoring only.")
        except Exception as e:
            print(f"[RiskEngine] Failed to load model: {e}. Using rule-based scoring.")
            self.model = None

    def assess_risk(self, sensor_data):
        """
        Perform comprehensive risk assessment combining ML + rules.

        Args:
            sensor_data: dict with sensor readings

        Returns:
            dict with risk assessment results
        """
        # Rule-based threshold assessment
        threshold_status = self._check_thresholds(sensor_data)

        # ML prediction (if model available)
        ml_prediction = self._ml_predict(sensor_data) if self.model else None

        # Combined risk score
        rule_score = self._calculate_rule_score(sensor_data, threshold_status)

        if ml_prediction:
            # Weighted combination: 60% ML + 40% rules
            combined_score = (ml_prediction['probability'] * 100 * 0.6) + (rule_score * 0.4)
            hazard_type = ml_prediction.get('hazard_type', self._determine_hazard_type(sensor_data))
            confidence = ml_prediction.get('confidence', 0.75)
            feature_importance = ml_prediction.get('feature_importance', {})
        else:
            combined_score = rule_score
            hazard_type = self._determine_hazard_type(sensor_data)
            confidence = 0.65  # Lower confidence without ML
            feature_importance = self._estimate_feature_importance(sensor_data)

        combined_score = min(round(combined_score), 100)
        severity = self._determine_severity(combined_score)

        # Time to critical estimation
        time_to_critical = self._estimate_time_to_critical(combined_score, sensor_data)

        return {
            'risk_score': combined_score,
            'severity': severity,
            'hazard_type': hazard_type,
            'probability': round(combined_score / 100, 2),
            'confidence': round(confidence, 2),
            'time_to_critical': time_to_critical,
            'threshold_status': threshold_status,
            'ml_available': self.model is not None,
            'feature_importance': feature_importance,
            'contributing_factors': self._get_contributing_factors(sensor_data, threshold_status),
            'model_version': self.model_metadata.get('version', 'N/A') if self.model_metadata else 'rule-based',
            'timestamp': datetime.now().isoformat()
        }

    def _check_thresholds(self, data):
        """Check sensor values against defined safety thresholds."""
        statuses = {}
        for param, thresholds in self.THRESHOLDS.items():
            value = data.get(param, 0)
            if value >= thresholds['critical']:
                statuses[param] = 'CRITICAL'
            elif value >= thresholds['warning']:
                statuses[param] = 'WARNING'
            else:
                statuses[param] = 'NORMAL'
        return statuses

    def _calculate_rule_score(self, data, threshold_status):
        """Calculate risk score from deterministic rules."""
        score = 0
        critical_count = sum(1 for s in threshold_status.values() if s == 'CRITICAL')
        warning_count = sum(1 for s in threshold_status.values() if s == 'WARNING')

        # Base score from threshold violations
        score += critical_count * 15
        score += warning_count * 7

        # Compound risk amplification
        # Gas + Temperature + Pressure all elevated = amplified risk
        gas_elevated = data.get('gas_ppm', 0) > 300
        temp_elevated = data.get('temperature', 0) > 60
        pressure_elevated = data.get('pressure', 0) > 7

        if gas_elevated and temp_elevated and pressure_elevated:
            score += 20  # Compound risk amplifier
        elif gas_elevated and temp_elevated:
            score += 10

        # Wind exposure toward populated area (SE direction ~135°)
        wind_dir = data.get('wind_direction', 315)
        wind_speed = data.get('wind_speed', 8)
        dir_toward_population = abs(wind_dir - 135) < 60
        if dir_toward_population and wind_speed > 15:
            score += 10

        return min(score, 100)

    def _ml_predict(self, sensor_data):
        """Use trained ML model for prediction."""
        try:
            features = self.model_metadata.get('feature_names', [])
            feature_values = [sensor_data.get(f, 0) for f in features]
            X = np.array([feature_values])

            # Get probability predictions
            if hasattr(self.model, 'predict_proba'):
                probas = self.model.predict_proba(X)[0]
                predicted_class = int(np.argmax(probas))
                max_proba = float(np.max(probas))
            else:
                predicted_class = int(self.model.predict(X)[0])
                max_proba = 0.7

            # Feature importance
            importance = {}
            if hasattr(self.model, 'feature_importances_'):
                for fname, imp in zip(features, self.model.feature_importances_):
                    importance[fname] = round(float(imp), 4)

            return {
                'predicted_class': predicted_class,
                'hazard_type': self.HAZARD_TYPES.get(predicted_class, 'Unknown'),
                'probability': max_proba,
                'confidence': max_proba,
                'feature_importance': importance,
            }
        except Exception as e:
            print(f"[RiskEngine] ML prediction error: {e}")
            return None

    def _determine_hazard_type(self, data):
        """Determine hazard type from rule-based analysis."""
        gas = data.get('gas_ppm', 0)
        temp = data.get('temperature', 0)
        pressure = data.get('pressure', 0)

        if gas > 450 and temp > 85:
            return 'Chemical Leak Escalation'
        elif temp > 85 and pressure > 8:
            return 'Thermal Runaway Risk'
        elif gas > 400:
            return 'Toxic Gas Exposure'
        elif pressure > 9:
            return 'Pressure Vessel Failure Risk'
        elif temp > 70:
            return 'Fire Escalation Risk'
        return 'Elevated Monitoring Required'

    def _determine_severity(self, score):
        """Map risk score to severity level."""
        if score >= 80:
            return 'CRITICAL'
        elif score >= 60:
            return 'HIGH'
        elif score >= 40:
            return 'ELEVATED'
        elif score >= 20:
            return 'MODERATE'
        return 'LOW'

    def _estimate_time_to_critical(self, current_score, data):
        """Estimate minutes until situation may become critical."""
        if current_score >= 80:
            return 5
        elif current_score >= 60:
            gas_rate = max(0, (data.get('gas_ppm', 0) - 300) / 50)
            return max(8, int(25 - gas_rate * 5))
        elif current_score >= 40:
            return 30
        return None  # Not approaching critical

    def _get_contributing_factors(self, data, threshold_status):
        """List the key factors contributing to current risk level."""
        factors = []
        for param, status in threshold_status.items():
            if status in ['CRITICAL', 'WARNING']:
                value = data.get(param, 0)
                threshold = self.THRESHOLDS[param]
                pct_over = round(((value - threshold['warning']) / threshold['warning']) * 100, 1)
                factors.append({
                    'parameter': param,
                    'value': value,
                    'status': status,
                    'percent_over_warning': max(0, pct_over),
                })
        factors.sort(key=lambda f: f['percent_over_warning'], reverse=True)
        return factors

    def _estimate_feature_importance(self, data):
        """Estimate feature importance when ML model is unavailable."""
        total = 0
        scores = {}
        for param in ['gas_ppm', 'temperature', 'pressure', 'humidity',
                       'wind_speed', 'vibration', 'air_quality']:
            value = data.get(param, 0)
            threshold = self.THRESHOLDS.get(param, {}).get('warning', 100)
            score = min(value / threshold, 2.0)
            scores[param] = score
            total += score

        if total > 0:
            return {k: round(v / total, 4) for k, v in scores.items()}
        return scores


# Global engine instance
risk_engine = RiskEngine()
