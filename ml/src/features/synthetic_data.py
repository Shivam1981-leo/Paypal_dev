"""Synthetic transaction data generator for fraud detection training

Generates realistic legitimate and fraudulent transactions with proper feature distributions.
Uses Polars for fast data processing.
"""

import polars as pl
import numpy as np
from faker import Faker
from datetime import datetime, timedelta
from typing import List, Dict
import random

fake = Faker()
Faker.seed(42)
np.random.seed(42)
random.seed(42)


class SyntheticDataGenerator:
    """Generate synthetic transaction data for fraud detection"""

    def __init__(self):
        self.fake = Faker()
        Faker.seed(42)

    def generate_legitimate_transactions(self, n: int = 10000) -> pl.DataFrame:
        """Generate legitimate transactions with realistic patterns"""

        print(f"Generating {n} legitimate transactions...")

        # Realistic amount distribution (log-normal)
        amounts = np.random.lognormal(mean=4.5, sigma=1.2, size=n)
        amounts = np.clip(amounts, 10, 5000)  # $10 - $5000 range

        # Country distribution (weighted towards US)
        countries = np.random.choice(
            ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT'],
            size=n,
            p=[0.50, 0.10, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04]
        )

        # VPN usage (5% of legitimate users)
        vpn_detected = np.random.choice([0, 1], size=n, p=[0.95, 0.05])

        # Account age (exponential distribution, mean ~6 months)
        account_age_days = np.random.exponential(180, size=n)
        account_age_days = np.clip(account_age_days, 1, 3650)  # 1 day to 10 years

        # Device reputation (mostly good for legitimate)
        device_reputation = np.random.beta(a=8, b=2, size=n)  # Skewed towards 1.0

        # Time on site (normal distribution, mean 120 seconds)
        time_on_site = np.random.normal(loc=120, scale=60, size=n)
        time_on_site = np.clip(time_on_site, 10, 600)

        # Pages visited (Poisson distribution)
        pages_visited = np.random.poisson(lam=5, size=n)
        pages_visited = np.clip(pages_visited, 1, 50)

        # Checkout speed (normal distribution, mean 45 seconds)
        checkout_speed = np.random.normal(loc=45, scale=20, size=n)
        checkout_speed = np.clip(checkout_speed, 10, 300)

        # Cart items (mostly 1-5 items)
        cart_item_count = np.random.choice([1, 2, 3, 4, 5], size=n, p=[0.3, 0.3, 0.2, 0.15, 0.05])

        # Digital items ratio (low for legitimate)
        digital_items_ratio = np.random.beta(a=2, b=8, size=n)  # Skewed towards 0

        # Generate timestamps (spread over last 30 days)
        base_date = datetime.now() - timedelta(days=30)
        timestamps = [
            base_date + timedelta(
                days=random.uniform(0, 30),
                hours=random.uniform(0, 24),
                minutes=random.uniform(0, 60)
            )
            for _ in range(n)
        ]

        data = {
            'transaction_id': [self.fake.uuid4() for _ in range(n)],
            'buyer_email': [self.fake.email() for _ in range(n)],
            'amount': amounts.round(2),
            'currency': ['USD'] * n,
            'device_id': [self.fake.sha256()[:32] for _ in range(n)],
            'ip_address': [self.fake.ipv4() for _ in range(n)],
            'country': countries,
            'vpn_detected': vpn_detected,
            'tor_detected': [0] * n,  # No Tor for legitimate
            'device_reputation_score': device_reputation.round(3),
            'account_age_days': account_age_days.round(0).astype(int),
            'time_on_site_seconds': time_on_site.round(0).astype(int),
            'pages_visited': pages_visited,
            'checkout_speed_seconds': checkout_speed.round(0).astype(int),
            'cart_item_count': cart_item_count,
            'digital_items_ratio': digital_items_ratio.round(3),
            'high_risk_items_count': np.zeros(n, dtype=int),
            'email_is_disposable': np.zeros(n, dtype=int),
            'geo_ip_billing_distance_km': np.random.uniform(0, 50, n).round(1),  # Low distance
            'timestamp': timestamps,
            'is_fraud': [0] * n  # Label
        }

        df = pl.DataFrame(data)
        print(f"✓ Generated {len(df)} legitimate transactions")
        return df

    def generate_fraudulent_transactions(self, n: int = 1000) -> pl.DataFrame:
        """Generate fraudulent transactions with suspicious patterns"""

        print(f"Generating {n} fraudulent transactions...")

        # High amounts (uniform distribution)
        amounts = np.random.uniform(low=300, high=5000, size=n)

        # High-risk countries (weighted)
        countries = np.random.choice(
            ['NG', 'RU', 'CN', 'VN', 'PK', 'ID', 'BR'],
            size=n,
            p=[0.20, 0.18, 0.15, 0.12, 0.12, 0.13, 0.10]
        )

        # High VPN usage (70% of fraudsters)
        vpn_detected = np.random.choice([0, 1], size=n, p=[0.30, 0.70])

        # Tor usage (30% of fraudsters)
        tor_detected = np.random.choice([0, 1], size=n, p=[0.70, 0.30])

        # Account age (very new accounts)
        account_age_days = np.random.exponential(5, size=n)  # Mean 5 days
        account_age_days = np.clip(account_age_days, 0, 60)

        # Device reputation (mostly bad)
        device_reputation = np.random.beta(a=2, b=8, size=n)  # Skewed towards 0

        # Time on site (very short, rushed)
        time_on_site = np.random.normal(loc=30, scale=15, size=n)
        time_on_site = np.clip(time_on_site, 5, 60)

        # Pages visited (few pages, direct to checkout)
        pages_visited = np.random.choice([1, 2, 3], size=n, p=[0.5, 0.3, 0.2])

        # Checkout speed (very fast, automated)
        checkout_speed = np.random.normal(loc=15, scale=5, size=n)
        checkout_speed = np.clip(checkout_speed, 5, 30)

        # Cart items (usually single high-value items)
        cart_item_count = np.random.choice([1, 2], size=n, p=[0.8, 0.2])

        # Digital items ratio (high for fraud - gift cards, etc.)
        digital_items_ratio = np.random.beta(a=8, b=2, size=n)  # Skewed towards 1

        # High-risk items (electronics, jewelry)
        high_risk_items_count = np.random.choice([1, 2, 3], size=n, p=[0.5, 0.3, 0.2])

        # Disposable emails (50% of fraudsters)
        email_is_disposable = np.random.choice([0, 1], size=n, p=[0.50, 0.50])

        # Large geographic distance (IP vs billing address)
        geo_ip_billing_distance_km = np.random.uniform(500, 5000, n).round(1)

        # Generate timestamps (spread over last 30 days)
        base_date = datetime.now() - timedelta(days=30)
        timestamps = [
            base_date + timedelta(
                days=random.uniform(0, 30),
                hours=random.uniform(0, 24),
                minutes=random.uniform(0, 60)
            )
            for _ in range(n)
        ]

        data = {
            'transaction_id': [self.fake.uuid4() for _ in range(n)],
            'buyer_email': [self.fake.email() for _ in range(n)],
            'amount': amounts.round(2),
            'currency': ['USD'] * n,
            'device_id': [self.fake.sha256()[:32] for _ in range(n)],
            'ip_address': [self.fake.ipv4() for _ in range(n)],
            'country': countries,
            'vpn_detected': vpn_detected,
            'tor_detected': tor_detected,
            'device_reputation_score': device_reputation.round(3),
            'account_age_days': account_age_days.round(0).astype(int),
            'time_on_site_seconds': time_on_site.round(0).astype(int),
            'pages_visited': pages_visited,
            'checkout_speed_seconds': checkout_speed.round(0).astype(int),
            'cart_item_count': cart_item_count,
            'digital_items_ratio': digital_items_ratio.round(3),
            'high_risk_items_count': high_risk_items_count,
            'email_is_disposable': email_is_disposable,
            'geo_ip_billing_distance_km': geo_ip_billing_distance_km,
            'timestamp': timestamps,
            'is_fraud': [1] * n  # Label
        }

        df = pl.DataFrame(data)
        print(f"✓ Generated {len(df)} fraudulent transactions")
        return df

    def generate_dataset(self, n_legitimate: int = 10000, n_fraud: int = 1000) -> pl.DataFrame:
        """Generate complete dataset with both legitimate and fraudulent transactions"""

        print("\n" + "="*60)
        print("GENERATING SYNTHETIC FRAUD DETECTION DATASET")
        print("="*60 + "\n")

        # Generate both types
        legit_df = self.generate_legitimate_transactions(n_legitimate)
        fraud_df = self.generate_fraudulent_transactions(n_fraud)

        # Combine and shuffle
        df = pl.concat([legit_df, fraud_df])
        df = df.sample(fraction=1.0, shuffle=True, seed=42)

        # Add sequential index
        df = df.with_row_index(name='index')

        print(f"\n" + "="*60)
        print(f"DATASET SUMMARY")
        print("="*60)
        print(f"Total Transactions: {len(df):,}")
        print(f"Legitimate: {n_legitimate:,} ({n_legitimate/len(df)*100:.1f}%)")
        print(f"Fraudulent: {n_fraud:,} ({n_fraud/len(df)*100:.1f}%)")
        print(f"Fraud Rate: {n_fraud/(n_legitimate+n_fraud)*100:.1f}%")
        print(f"Features: {len(df.columns)-2}")  # Excluding index and label
        print("="*60 + "\n")

        return df

    def save_dataset(self, df: pl.DataFrame, output_path: str):
        """Save dataset to Parquet format"""

        print(f"Saving dataset to {output_path}...")
        df.write_parquet(output_path)

        # Print file size
        import os
        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"✓ Saved! File size: {file_size_mb:.2f} MB")

        # Print sample
        print(f"\nFirst 5 rows:")
        print(df.head(5))


if __name__ == "__main__":
    from pathlib import Path

    # Initialize generator
    generator = SyntheticDataGenerator()

    # Generate dataset (10,000 legitimate + 1,000 fraud = 10% fraud rate)
    df = generator.generate_dataset(n_legitimate=10000, n_fraud=1000)

    # Save to parquet
    output_dir = Path(__file__).parent.parent / "data" / "synthetic"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "transactions.parquet"

    generator.save_dataset(df, str(output_path))

    print("\n✅ Synthetic data generation complete!")
