# KYC Document Processing Project

This project automates the processing of Know Your Customer (KYC) documents using OCR, data extraction, and verification techniques. It includes features for batch processing, data anonymization, compliance checking, and model deployment.

## Features

- **Automated Document Processing**
  - OCR-based text extraction from KYC documents
  - Support for multiple image formats (JPG, PNG)
  - Image preprocessing for improved OCR accuracy
  - Batch processing with progress tracking
  
- **Data Processing & Security**
  - Automated data extraction for key fields
  - Data validation and error checking
  - Sensitive data anonymization
  - Address standardization
  
- **Compliance & Verification**
  - KYC rules compliance checking
  - AML compliance verification
  - Model-based verification
  - Deployment verification
  
- **Export Capabilities**
  - Multi-format export (CSV, Excel, JSON)
  - Batch-wise intermediate results
  - Progress tracking and logging
  - Detailed processing reports

## Project Structure

```
Kyc/
├── data/
│   ├── raw_documents/     # Input KYC documents
│   ├── logs/             # Processing logs
│   └── processed/        # Processed data outputs
├── module1_data_collection/
│   ├── data_collection_preprocessing.py  # Core processing logic
│   └── batch_processor.py                # Batch processing implementation
├── module2_model_development/
│   └── model_training.py                 # ML model training
├── module3_compliance_integration/
│   └── compliance_checker.py             # Compliance verification
├── module4_deployment_and_verification/
│   └── deployment_script.py              # Deployment management
├── main.py              # Main execution script
└── requirements.txt     # Project dependencies
```

## Prerequisites

- Python 3.8 or higher
- Tesseract OCR engine
- OpenCV
- Required Python packages (see requirements.txt)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd Kyc
   ```

2. Install Tesseract OCR:
   - Windows: Download and install from [Tesseract GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - Linux: `sudo apt-get install tesseract-ocr`
   - Mac: `brew install tesseract`

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Prepare Your Documents**
   - Place KYC documents in the `data/raw_documents/` directory
   - Supported formats: JPG, PNG
   - Naming convention: Should start with 'aadhaar_' or 'aadhar_'

2. **Run the Processing Pipeline**
   ```bash
   python main.py
   ```
   This will:
   - Process all documents in batches
   - Generate processed data in multiple formats
   - Perform compliance checks
   - Deploy and verify the model

3. **Check the Results**
   - Processed data will be saved in multiple formats:
     - CSV: `data/kyc_processed_data_[timestamp].csv`
     - Excel: `data/kyc_processed_data_[timestamp].xlsx`
     - JSON: `data/kyc_processed_data_[timestamp].json`
   - Processing logs are available in `data/logs/`

## Configuration

Key configuration options in `batch_processor.py`:
- `batch_size`: Number of documents to process in each batch (default: 5)
- `data_dir`: Directory for processed data and logs

## Error Handling

The system includes comprehensive error handling:
- Invalid document format detection
- OCR failure recovery with multiple attempts
- Data validation with detailed error reporting
- Batch processing error isolation

## Logging

Detailed logs are maintained for:
- Document processing status
- Validation errors
- OCR performance
- Batch processing progress
- Compliance check results

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.