"""Feature engineering for fraud detection

Extracts 50+ engineered features across 10 categories for fraud detection.
Uses Polars for high-performance data processing.
"""

import polars as pl
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional
import hashlib


class FeatureEngineer:
    """Extract and engineer features for fraud detection model"""

    def __init__(self):
        # High-risk country codes (based on typical fraud patterns)
        self.high_risk_countries = {
            'NG', 'RU', 'CN', 'VN', 'PK', 'ID', 'BR', 'IN', 'BD', 'UA'
        }

        # Disposable email domains
        self.disposable_domains = {
            'tempmail.com', 'guerrillamail.com', '10minutemail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org'
        }

    def extract_all_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Extract all feature categories"""

        print("Extracting features...")

        # Apply each feature category
        df = self._add_velocity_features(df)
        df = self._add_amount_features(df)
        df = self._add_geographic_features(df)
        df = self._add_device_features(df)
        df = self._add_behavioral_features(df)
        df = self._add_account_features(df)
        df = self._add_cart_features(df)
        df = self._add_temporal_features(df)
        df = self._add_merchant_features(df)
        df = self._add_cross_reference_features(df)

        print(f"✓ Extracted {len(df.columns)} total features")
        return df

    def _add_velocity_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Velocity-based features - transaction frequency patterns"""

        # Transactions per email (last 24h, 7d, 30d)
        df = df.with_columns([
            pl.col('buyer_email').count().over('buyer_email').alias('email_txn_count_total'),
            pl.col('device_id').count().over('device_id').alias('device_txn_count_total'),
            pl.col('ip_address').count().over('ip_address').alias('ip_txn_count_total')
        ])

        # Amount velocity (sum of amounts per entity)
        df = df.with_columns([
            pl.col('amount').sum().over('buyer_email').alias('email_total_amount'),
            pl.col('amount').sum().over('device_id').alias('device_total_amount'),
            pl.col('amount').sum().over('ip_address').alias('ip_total_amount')
        ])

        return df

    def _add_amount_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Amount-based statistical features"""

        # Z-score of amount (how unusual is this amount?)
        amount_mean = df['amount'].mean()
        amount_std = df['amount'].std()

        df = df.with_columns([
            ((pl.col('amount') - amount_mean) / amount_std).alias('amount_zscore'),
            pl.col('amount').log().alias('amount_log'),
            (pl.col('amount') > 1000).cast(pl.Int32).alias('amount_is_high'),
            (pl.col('amount') > 500).cast(pl.Int32).alias('amount_is_medium_high')
        ])

        # Percentile rank
        df = df.with_columns([
            pl.col('amount').rank(method='average').alias('amount_rank')
        ])

        return df

    def _add_geographic_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Geographic and location-based features"""

        # High-risk country indicator
        df = df.with_columns([
            pl.col('country').is_in(list(self.high_risk_countries)).cast(pl.Int32).alias('is_high_risk_country'),
            pl.col('geo_ip_billing_distance_km').alias('geo_distance'),
            (pl.col('geo_ip_billing_distance_km') > 100).cast(pl.Int32).alias('geo_distance_suspicious'),
            (pl.col('geo_ip_billing_distance_km') > 500).cast(pl.Int32).alias('geo_distance_very_suspicious')
        ])

        # Country transaction frequency
        df = df.with_columns([
            pl.col('country').count().over('country').alias('country_txn_count')
        ])

        return df

    def _add_device_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Device fingerprinting and reputation features"""

        df = df.with_columns([
            pl.col('device_reputation_score').alias('device_reputation'),
            (pl.col('device_reputation_score') < 0.3).cast(pl.Int32).alias('device_reputation_low'),
            (pl.col('device_reputation_score') < 0.5).cast(pl.Int32).alias('device_reputation_medium'),
            pl.col('vpn_detected').cast(pl.Int32).alias('is_vpn'),
            pl.col('tor_detected').cast(pl.Int32).alias('is_tor'),
            (pl.col('vpn_detected') | pl.col('tor_detected')).cast(pl.Int32).alias('is_anonymized')
        ])

        return df

    def _add_behavioral_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Session and browsing behavior features"""

        df = df.with_columns([
            pl.col('time_on_site_seconds').alias('session_duration'),
            (pl.col('time_on_site_seconds') < 30).cast(pl.Int32).alias('session_duration_very_short'),
            (pl.col('time_on_site_seconds') < 60).cast(pl.Int32).alias('session_duration_short'),
            pl.col('pages_visited').alias('pages_viewed'),
            (pl.col('pages_visited') <= 2).cast(pl.Int32).alias('pages_viewed_low'),
            pl.col('checkout_speed_seconds').alias('checkout_speed'),
            (pl.col('checkout_speed_seconds') < 20).cast(pl.Int32).alias('checkout_speed_very_fast'),
            (pl.col('checkout_speed_seconds') < 40).cast(pl.Int32).alias('checkout_speed_fast')
        ])

        # Behavioral score (composite)
        df = df.with_columns([
            (
                (pl.col('time_on_site_seconds') / 120.0) * 0.3 +
                (pl.col('pages_visited') / 10.0) * 0.4 +
                (1 - pl.col('checkout_speed_seconds') / 100.0) * 0.3
            ).clip(0, 1).alias('behavioral_score')
        ])

        return df

    def _add_account_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Account age and reputation features"""

        df = df.with_columns([
            pl.col('account_age_days').alias('account_age'),
            (pl.col('account_age_days') < 7).cast(pl.Int32).alias('account_age_very_new'),
            (pl.col('account_age_days') < 30).cast(pl.Int32).alias('account_age_new'),
            (pl.col('account_age_days') > 365).cast(pl.Int32).alias('account_age_established'),
            pl.col('email_is_disposable').cast(pl.Int32).alias('email_disposable'),
            (pl.col('account_age_days') / 365.0).clip(0, 1).alias('account_trust_score')
        ])

        return df

    def _add_cart_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Shopping cart analysis features"""

        df = df.with_columns([
            pl.col('cart_item_count').alias('cart_items'),
            (pl.col('cart_item_count') == 1).cast(pl.Int32).alias('cart_single_item'),
            pl.col('digital_items_ratio').alias('digital_ratio'),
            (pl.col('digital_items_ratio') > 0.5).cast(pl.Int32).alias('cart_mostly_digital'),
            (pl.col('digital_items_ratio') == 1.0).cast(pl.Int32).alias('cart_all_digital'),
            pl.col('high_risk_items_count').alias('high_risk_items'),
            (pl.col('high_risk_items_count') > 0).cast(pl.Int32).alias('has_high_risk_items')
        ])

        # Average item value
        df = df.with_columns([
            (pl.col('amount') / pl.col('cart_item_count')).alias('avg_item_value')
        ])

        return df

    def _add_temporal_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Time-based pattern features"""

        df = df.with_columns([
            pl.col('timestamp').dt.hour().alias('hour_of_day'),
            pl.col('timestamp').dt.weekday().alias('day_of_week'),
            pl.col('timestamp').dt.month().alias('month'),
            # Night time transactions (12am - 6am) are more suspicious
            ((pl.col('timestamp').dt.hour() >= 0) &
             (pl.col('timestamp').dt.hour() < 6)).cast(pl.Int32).alias('is_night_time'),
            # Weekend transactions
            (pl.col('timestamp').dt.weekday() >= 5).cast(pl.Int32).alias('is_weekend')
        ])

        return df

    def _add_merchant_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Merchant-related features (placeholder for future expansion)"""

        # For now, add derived merchant risk indicators
        df = df.with_columns([
            # High-risk transaction indicator (combination of factors)
            (
                (pl.col('amount') > 1000) &
                (pl.col('digital_items_ratio') > 0.5) &
                (pl.col('account_age_days') < 30)
            ).cast(pl.Int32).alias('merchant_high_risk_txn')
        ])

        return df

    def _add_cross_reference_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Network analysis and cross-reference features"""

        # Unique devices per email
        df = df.with_columns([
            pl.col('device_id').n_unique().over('buyer_email').alias('email_device_count'),
            pl.col('ip_address').n_unique().over('buyer_email').alias('email_ip_count')
        ])

        # Suspicious patterns
        df = df.with_columns([
            (pl.col('email_device_count') > 3).cast(pl.Int32).alias('email_multiple_devices'),
            (pl.col('email_ip_count') > 5).cast(pl.Int32).alias('email_multiple_ips')
        ])

        return df

    def get_feature_names(self) -> List[str]:
        """Get list of all engineered feature names (excluding raw inputs)"""

        return [
            # Velocity features
            'email_txn_count_total', 'device_txn_count_total', 'ip_txn_count_total',
            'email_total_amount', 'device_total_amount', 'ip_total_amount',

            # Amount features
            'amount_zscore', 'amount_log', 'amount_is_high', 'amount_is_medium_high',
            'amount_rank',

            # Geographic features
            'is_high_risk_country', 'geo_distance', 'geo_distance_suspicious',
            'geo_distance_very_suspicious', 'country_txn_count',

            # Device features
            'device_reputation', 'device_reputation_low', 'device_reputation_medium',
            'is_vpn', 'is_tor', 'is_anonymized',

            # Behavioral features
            'session_duration', 'session_duration_very_short', 'session_duration_short',
            'pages_viewed', 'pages_viewed_low', 'checkout_speed', 'checkout_speed_very_fast',
            'checkout_speed_fast', 'behavioral_score',

            # Account features
            'account_age', 'account_age_very_new', 'account_age_new',
            'account_age_established', 'email_disposable', 'account_trust_score',

            # Cart features
            'cart_items', 'cart_single_item', 'digital_ratio', 'cart_mostly_digital',
            'cart_all_digital', 'high_risk_items', 'has_high_risk_items', 'avg_item_value',

            # Temporal features
            'hour_of_day', 'day_of_week', 'month', 'is_night_time', 'is_weekend',

            # Merchant features
            'merchant_high_risk_txn',

            # Cross-reference features
            'email_device_count', 'email_ip_count', 'email_multiple_devices',
            'email_multiple_ips'
        ]

    def select_model_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Select only the features needed for model training/inference"""

        feature_cols = self.get_feature_names()

        # Include label if it exists
        cols_to_select = feature_cols.copy()
        if 'is_fraud' in df.columns:
            cols_to_select.append('is_fraud')

        return df.select(cols_to_select)


if __name__ == "__main__":
    from pathlib import Path

    print("\n🔧 Feature Engineering Test\n")

    # Load synthetic data
    data_path = Path(__file__).parent.parent.parent / "data" / "synthetic" / "transactions.parquet"

    if data_path.exists():
        print(f"Loading data from {data_path}...")
        df = pl.read_parquet(data_path)
        print(f"✓ Loaded {len(df)} transactions\n")

        # Extract features
        engineer = FeatureEngineer()
        df_features = engineer.extract_all_features(df)

        print(f"\n📊 Feature Engineering Complete")
        print(f"Total columns: {len(df_features.columns)}")
        print(f"Engineered features: {len(engineer.get_feature_names())}")

        # Show sample
        print(f"\nSample features (first 3 rows):")
        feature_df = engineer.select_model_features(df_features)
        print(feature_df.head(3))

        # Save processed features
        output_path = Path(__file__).parent.parent.parent / "data" / "processed" / "features.parquet"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        feature_df.write_parquet(output_path)
        print(f"\n✓ Saved features to {output_path}")
    else:
        print(f"❌ Data not found at {data_path}")
        print("Run: python scripts/generate_data.py")
