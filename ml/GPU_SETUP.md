# GPU Training Setup Guide

## RTX 5050 GPU Acceleration

PayGuard AI's training pipeline automatically uses your NVIDIA RTX 5050 GPU for faster model training (5-10x speedup vs CPU).

## Prerequisites

### 1. NVIDIA Driver

Ensure you have the latest NVIDIA driver installed:

```bash
# Check NVIDIA driver
nvidia-smi
```

You should see output showing your RTX 5050 GPU.

**If not installed:**
- Download from: https://www.nvidia.com/Download/index.aspx
- Select: GeForce RTX 50 Series → RTX 5050
- Install and reboot

### 2. CUDA Toolkit

XGBoost 2.1.2 requires CUDA 11.8 or 12.x:

**Windows:**
1. Download CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
2. Select CUDA 12.x (compatible with RTX 5050)
3. Install with default settings

**Linux:**
```bash
# Ubuntu/Debian
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-3
```

### 3. Verify CUDA Installation

```bash
# Check CUDA version
nvcc --version

# Should show: CUDA 12.x
```

## Python Environment Setup

### Install XGBoost with GPU Support

The standard `xgboost==2.1.2` package includes GPU support by default. Just ensure CUDA is installed:

```bash
pip install xgboost==2.1.2
```

### Verify GPU is Available

```python
import xgboost as xgb

# Check if GPU is available
print(xgb.XGBClassifier(device='cuda').get_params()['device'])
```

## Training with GPU

The training script **automatically detects** your GPU:

```bash
cd ml
python scripts/train_model.py
```

You'll see:
```
✓ NVIDIA GPU detected (RTX 5050)
Training device: CUDA
Tree method: hist
```

### Manual GPU Configuration

If you want to force CPU or GPU:

**Force GPU:**
```python
# In train_model.py, set:
device = 'cuda'
tree_method = 'hist'
```

**Force CPU:**
```python
# In train_model.py, set:
device = 'cpu'
tree_method = 'hist'
```

## Performance Comparison

Training on 590K Vesta transactions (500 trees):

| Device | Time | Speedup |
|--------|------|---------|
| **RTX 5050 (GPU)** | ~5-10 min | **1x (baseline)** |
| Intel i5-13450HX (10 cores) | ~20-25 min | 2-4x slower |
| Intel i7 (8 cores) | ~25-30 min | 3-5x slower |
| Intel i5 (4 cores) | ~40-50 min | 5-8x slower |

*Note: Your i5-13450HX is a powerful CPU with 10 cores (6 P-cores + 4 E-cores), so CPU training is still reasonably fast, but GPU provides significant speedup for this dataset size.*

## GPU Memory Requirements

- **RTX 5050**: 8 GB VRAM (sufficient for Vesta dataset)
- **Dataset**: ~2 GB in memory
- **Model training**: ~3-4 GB peak usage
- **Remaining**: ~2-3 GB for system

## Troubleshooting

### Issue: "CUDA not available" despite GPU being present

**Solution 1**: Check NVIDIA driver
```bash
nvidia-smi
```

**Solution 2**: Reinstall CUDA Toolkit
- Ensure CUDA 12.x is installed
- Add CUDA to PATH:
  - Windows: `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.3\bin`
  - Linux: `export PATH=/usr/local/cuda-12.3/bin:$PATH`

**Solution 3**: Reinstall XGBoost
```bash
pip uninstall xgboost
pip install xgboost==2.1.2
```

### Issue: "Out of memory" during training

**Solution**: Reduce batch size or use gradient-based one-side sampling
```python
params = {
    'tree_method': 'hist',
    'max_bin': 256,  # Reduce from 512
    'n_estimators': 300,  # Reduce from 500
}
```

### Issue: Training slower on GPU than CPU

**Possible causes:**
1. Small dataset (GPU overhead not worth it for <100K samples)
2. CPU-GPU data transfer bottleneck
3. Old CUDA version

**Solution**: Vesta dataset (590K samples) should be faster on GPU. If not:
```python
# Use GPU predictor for better performance
params['predictor'] = 'gpu_predictor'
```

### Issue: "XGBoost was not built with GPU support"

**Solution**: You have CPU-only XGBoost. Reinstall:
```bash
pip uninstall xgboost
pip cache purge
pip install xgboost==2.1.2
```

## Monitoring GPU Usage

### During Training

**Windows:**
```bash
# Open Task Manager → Performance → GPU
# Or use nvidia-smi in another terminal
nvidia-smi -l 1
```

**Linux:**
```bash
watch -n 1 nvidia-smi
```

You should see:
- **GPU Utilization**: 80-95%
- **Memory Usage**: 3-4 GB
- **Temperature**: 60-75°C (normal under load)

### TensorBoard (Optional)

Monitor training metrics in real-time:
```bash
pip install tensorboard
tensorboard --logdir=ml/logs
```

## Best Practices

1. **Keep drivers updated**: Update NVIDIA driver every 2-3 months
2. **Monitor temperature**: Keep GPU under 85°C during training
3. **Use virtual environment**: Isolate Python dependencies
4. **Close other GPU applications**: Free up VRAM (Chrome, games, video editors)
5. **Batch training**: Train multiple models overnight on GPU

## Additional GPU Optimizations

### Multi-GPU Training (Future)

If you add more GPUs:
```python
params['device'] = 'cuda:0,cuda:1'  # Use GPU 0 and 1
```

### Mixed Precision Training

For faster training with minimal accuracy loss:
```python
params['tree_method'] = 'gpu_hist'
params['predictor'] = 'gpu_predictor'
```

### RAPIDS cuDF (Advanced)

Use GPU-accelerated dataframes for even faster preprocessing:
```bash
pip install cudf-cu12
```

```python
import cudf
df = cudf.read_parquet('data.parquet')  # 10x faster on GPU
```

## Resources

- **XGBoost GPU Documentation**: https://xgboost.readthedocs.io/en/stable/gpu/index.html
- **CUDA Toolkit**: https://developer.nvidia.com/cuda-toolkit
- **NVIDIA Developer Forum**: https://forums.developer.nvidia.com/

## Support

If GPU training issues persist:
1. Check CUDA compatibility: https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/
2. Verify XGBoost version: `pip show xgboost`
3. Test with minimal example:
```python
import xgboost as xgb
import numpy as np

X = np.random.rand(1000, 10)
y = np.random.randint(0, 2, 1000)

model = xgb.XGBClassifier(device='cuda', tree_method='hist')
model.fit(X, y)
print("GPU training successful!")
```
