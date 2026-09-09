"""
SANRAKSHAK - Data Preprocessing Module
Handles data validation, cleaning, feature engineering, and preparation.
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder


class DataPreprocessor:
    """Validates, cleans, and prepares industrial sensor data for ML training."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.target_name = 'hazard_level'
        self.validation_report = {}

    def load_and_validate(self, filepath):
        """
        Load dataset and perform comprehensive validation.
        Returns (dataframe, validation_report) or raises ValueError.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset not found: {filepath}")

        df = pd.read_csv(filepath)
        report = self._validate_dataset(df)
        self.validation_report = report

        if report.get('critical_issues'):
            raise ValueError(
                f"Dataset has critical issues: {report['critical_issues']}"
            )

        print(f"[Preprocessor] Loaded {len(df)} rows, {len(df.columns)} columns")
        print(f"[Preprocessor] Target: {self.target_name}")
        print(f"[Preprocessor] Class distribution: {df[self.target_name].value_counts().to_dict()}")

        return df, report

    def _validate_dataset(self, df):
        """Comprehensive data validation."""
        report = {
            'n_samples': len(df),
            'n_features': len(df.columns),
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'missing_values': df.isnull().sum().to_dict(),
            'total_missing': int(df.isnull().sum().sum()),
            'duplicates': int(df.duplicated().sum()),
            'critical_issues': [],
            'warnings': [],
        }

        # Check target column exists
        if self.target_name not in df.columns:
            report['critical_issues'].append(
                f"Target column '{self.target_name}' not found. "
                f"Available columns: {list(df.columns)}"
            )
            return report

        # Target distribution
        target_dist = df[self.target_name].value_counts()
        report['target_distribution'] = target_dist.to_dict()
        report['n_classes'] = len(target_dist)

        # Check for extreme class imbalance
        min_class = target_dist.min()
        max_class = target_dist.max()
        if min_class < 5:
            report['warnings'].append(
                f"Very few samples in minority class ({min_class}). "
                f"Stratification may be difficult."
            )

        # Check missing values
        missing_pct = (df.isnull().sum() / len(df) * 100)
        high_missing = missing_pct[missing_pct > 20]
        if len(high_missing) > 0:
            report['warnings'].append(
                f"High missing values: {high_missing.to_dict()}"
            )

        # Check for constant columns
        for col in df.select_dtypes(include=[np.number]).columns:
            if df[col].std() == 0:
                report['warnings'].append(f"Constant column: {col}")

        # Outlier detection (IQR method)
        outlier_cols = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)).sum()
            if outliers > 0:
                outlier_cols[col] = int(outliers)
        report['outliers'] = outlier_cols

        # Feature correlations
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 1:
            corr = df[numeric_cols].corr()
            high_corr = []
            for i in range(len(corr.columns)):
                for j in range(i + 1, len(corr.columns)):
                    if abs(corr.iloc[i, j]) > 0.9:
                        high_corr.append(
                            f"{corr.columns[i]} ↔ {corr.columns[j]}: {corr.iloc[i, j]:.2f}"
                        )
            if high_corr:
                report['warnings'].append(f"Highly correlated features: {high_corr}")

        return report

    def prepare_features(self, df):
        """
        Prepare feature matrix and target vector.
        Handles encoding, scaling, and derived features.
        """
        # Drop non-feature columns
        drop_cols = ['sample_id', self.target_name]
        feature_cols = [c for c in df.columns if c not in drop_cols]

        X = df[feature_cols].copy()
        y = df[self.target_name].copy()

        # Handle missing values (fill with median for numeric)
        for col in X.select_dtypes(include=[np.number]).columns:
            if X[col].isnull().any():
                X[col].fillna(X[col].median(), inplace=True)

        # Derive additional features where data supports it
        X = self._engineer_features(X)

        # Encode target
        y_encoded = self.label_encoder.fit_transform(y)

        # Scale features
        self.feature_names = list(X.columns)
        X_scaled = self.scaler.fit_transform(X)

        print(f"[Preprocessor] Features: {self.feature_names}")
        print(f"[Preprocessor] Target classes: {list(self.label_encoder.classes_)}")
        print(f"[Preprocessor] X shape: {X_scaled.shape}")

        return X_scaled, y_encoded

    def _engineer_features(self, X):
        """Create derived features from available data."""
        derived = X.copy()

        # Gas-Temperature interaction (both elevated = compound risk)
        if 'gas_ppm' in derived.columns and 'temperature' in derived.columns:
            derived['gas_temp_interaction'] = (
                derived['gas_ppm'] / 300 * derived['temperature'] / 60
            )

        # Pressure change indicator (deviation from normal ~5 bar)
        if 'pressure' in derived.columns:
            derived['pressure_deviation'] = abs(derived['pressure'] - 5.0)

        # Wind exposure toward populated area (SE ~135°)
        if 'wind_direction' in derived.columns and 'wind_speed' in derived.columns:
            # How much wind aims at populated zone
            dir_diff = derived['wind_direction'].apply(
                lambda d: 1 - min(abs(d - 135), 360 - abs(d - 135)) / 180
            )
            derived['wind_exposure'] = dir_diff * derived['wind_speed'] / 30

        # Combined sensor anomaly score
        if all(c in derived.columns for c in ['gas_ppm', 'temperature', 'vibration']):
            derived['combined_anomaly'] = (
                derived['gas_ppm'] / 450 +
                derived['temperature'] / 85 +
                derived['vibration'] / 18
            ) / 3

        return derived

    def transform_single(self, sensor_data):
        """Transform a single sensor reading for production prediction."""
        row = pd.DataFrame([sensor_data])

        # Select only known feature columns (before engineering)
        base_features = [c for c in row.columns if c in [
            'gas_ppm', 'temperature', 'pressure', 'humidity',
            'wind_speed', 'wind_direction', 'vibration', 'air_quality',
            'flow_rate', 'hour_of_day'
        ]]
        row = row[base_features]

        # Apply same feature engineering
        row = self._engineer_features(row)

        # Ensure columns match training features
        for col in self.feature_names:
            if col not in row.columns:
                row[col] = 0

        row = row[self.feature_names]

        return self.scaler.transform(row)
