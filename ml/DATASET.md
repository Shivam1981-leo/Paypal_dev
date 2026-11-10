# Vesta Dataset Integration Guide

## About the Dataset

**IEEE-CIS Fraud Detection Dataset** (Vesta Corporation)

This is a real-world e-commerce fraud detection dataset from Vesta Corporation, a leading payment service company. It contains actual transaction data from their fraud prevention system.

### Dataset Specifications

- **Source**: Kaggle IEEE-CIS Fraud Detection Competition
- **Size**: ~590,000 transactions (training set)
- **Time Period**: 6 months of real transactions (Dec 2017 - Jun 2018)
- **Fraud Rate**: ~3.5% (realistic production imbalance)
- **File Size**: ~1.2 GB (compressed download)
- **Features**: 434 anonymized features across two tables

### Dataset Structure

**Transaction Table** (`train_transaction.csv`)
- Transaction amounts, product codes, card details
- 394 features including V1-V339 (anonymized features)
- TransactionDT: timedelta from reference point
- TransactionAmt: transaction payment amount in USD

**Identity Table** (`train_identity.csv`)
- Device and identity information
- 40 features including device type, OS, browser
- Device IDs and network information
- Digital signature data

## Setup Instructions

### 1. Accept Competition Rules

Before downloading, you must accept the competition rules:
1. Go to: https://www.kaggle.com/c/ieee-fraud-detection/rules
2. Click "I Understand and Accept"

### 2. Configure Kaggle API

```bash
# Install Kaggle CLI
pip install kaggle

# Get your API credentials
# 1. Go to https://www.kaggle.com/settings/account
# 2. Click "Create New API Token"
# 3. Download kaggle.json
```

**Linux/Mac:**
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

**Windows:**
```powershell
mkdir $env:USERPROFILE\.kaggle
move $env:USERPROFILE\Downloads\kaggle.json $env:USERPROFILE\.kaggle\
```

### 3. Download Dataset

```bash
cd ml
python scripts/download_vesta_dataset.py
```

This will:
- Download ~1.2 GB of data
- Extract to `data/raw/`
- Verify all required files are present

**Expected files:**
- `train_transaction.csv` (~450 MB)
- `train_identity.csv` (~35 MB)
- `test_transaction.csv` (~350 MB)
- `test_identity.csv` (~30 MB)

### 4. Preprocess Data

```bash
python scripts/preprocess_vesta_data.py
```

This will:
- Load and merge transaction + identity tables
- Engineer additional features
- Handle missing values
- Create time-based train/validation split (80/20)
- Save processed data as Parquet files

**Output:**
- `data/processed/vesta_train.parquet` (~400K samples)
- `data/processed/vesta_val.parquet` (~100K samples)

### 5. Train Model

```bash
python scripts/train_model.py
```

Training on Vesta dataset takes approximately:
- **CPU**: 15-30 minutes
- **GPU**: 5-10 minutes

## Feature Engineering

The preprocessing pipeline creates these additional features:

### Transaction Features
- `TransactionAmt_log`: Log-transformed amount (handles skewness)
- `TransactionAmt_decimal`: Decimal part of amount (fraud indicator)

### Temporal Features
- `transaction_hour`: Hour of day (0-23)
- `transaction_dow`: Day of week (0-6)

### Device Features
- `device_is_windows`: Binary flag for Windows devices
- `device_is_ios`: Binary flag for iOS devices
- `device_is_android`: Binary flag for Android devices
- `device_is_mac`: Binary flag for Mac devices

### Email Features
- `email_domains_match`: Whether purchaser and recipient emails match

### Missing Value Handling
- Numeric features: Fill with -999 (preserves missingness signal)
- Categorical features: Fill with "unknown"

## Data Privacy

The Vesta dataset is fully anonymized:
- Personal identifiable information (PII) is removed
- Feature names are anonymized (V1, V2, etc.)
- Amounts and values are normalized
- Time is represented as deltas from reference point

This ensures:
✅ GDPR compliance
✅ PCI DSS compliance
✅ Safe for research and development
✅ No customer privacy concerns

## Model Performance Expectations

With Vesta dataset, expect these metrics:

| Metric | Target | Typical |
|--------|--------|---------|
| **AUC-ROC** | > 0.90 | 0.92-0.95 |
| **Precision** | > 0.80 | 0.82-0.88 |
| **Recall** | > 0.75 | 0.78-0.85 |
| **F1 Score** | > 0.75 | 0.80-0.86 |
| **False Positive Rate** | < 5% | 2-4% |

## Troubleshooting

### Issue: "403 Forbidden" when downloading

**Solution**: Accept competition rules at https://www.kaggle.com/c/ieee-fraud-detection/rules

### Issue: "Could not find kaggle.json"

**Solution**: Follow Kaggle API setup instructions above

### Issue: Out of memory during preprocessing

**Solution**: 
- Polars uses lazy evaluation by default
- If still having issues, reduce `infer_schema_length` in preprocessing script
- Or preprocess in chunks

### Issue: Slow training

**Solution**:
- Enable GPU: Change `device: 'cpu'` to `device: 'cuda'` in train_model.py
- Reduce `n_estimators` from 500 to 200 for faster training
- Use `tree_method: 'approx'` instead of `'hist'`

## Dataset Citation

```
@inproceedings{ieee-cis-fraud-detection,
  title={IEEE-CIS Fraud Detection},
  author={IEEE Computational Intelligence Society and Vesta Corporation},
  year={2019},
  url={https://www.kaggle.com/c/ieee-fraud-detection}
}
```

## Additional Resources

- **Kaggle Competition**: https://www.kaggle.com/c/ieee-fraud-detection
- **Discussions**: https://www.kaggle.com/c/ieee-fraud-detection/discussion
- **Winning Solutions**: https://www.kaggle.com/c/ieee-fraud-detection/discussion/111308
- **Feature Explanations**: https://www.kaggle.com/c/ieee-fraud-detection/discussion/101203

## Next Steps

After successful integration:
1. ✅ Train baseline model with default hyperparameters
2. 🔧 Tune hyperparameters using validation set
3. 📊 Analyze feature importance
4. 🚀 Deploy to production API
5. 📈 Monitor performance on real PayPal transactions
6. 🔄 Implement continuous learning pipeline
