import os
import pandas as pd
from module1_data_collection.data_collection_preprocessing import DataProcessor
from module1_data_collection.batch_processor import BatchProcessor
from module2_model_development.model_training import ModelTrainer
from module3_compliance_integration.compliance_checker import ComplianceChecker
from module4_deployment_and_verification.deployment_script import Deployment

def main():
    """Main function to run the KYC processing and model deployment pipeline."""
    print("Starting KYC processing and model deployment pipeline...")

    try:
        # Initialize components
        batch_processor = BatchProcessor(batch_size=5)
        model_trainer = ModelTrainer()
        compliance_checker = ComplianceChecker()
        deployer = Deployment()

        # Step 1: Data Collection and Preprocessing with Batch Processing
        print("\n--- Step 1: Data Collection and Preprocessing ---")
        data_dir = os.path.join(os.getcwd(), "data", "raw_documents")
        
        # Process documents in batches with progress tracking
        df_processed = batch_processor.process_all_documents(data_dir)
        
        # Export processed data in multiple formats
        if not df_processed.empty:
            print("\n--- Exporting Processed Data ---")
            csv_path = batch_processor.export_results(df_processed, 'csv')
            excel_path = batch_processor.export_results(df_processed, 'excel')
            json_path = batch_processor.export_results(df_processed, 'json')
            
            print(f"\nProcessed data exported to:")
            print(f"CSV: {csv_path}")
            print(f"Excel: {excel_path}")
            print(f"JSON: {json_path}")
            
            print("\n--- Processed Data Summary ---")
            print(f"Total documents processed: {len(df_processed)}")
            print(f"Columns: {', '.join(df_processed.columns)}")
            
            if len(df_processed) > 0:
                print("\n--- Anonymized Text Sample ---")
                print(df_processed['anonymized_text'].iloc[0])

            # Step 2: Model Development
            print("\n--- Step 2: Model Development ---")
            model_trainer.train_model(df_processed)
            model_trainer.evaluate_model(df_processed)

            # Step 3: Compliance Integration
            print("\n--- Step 3: Compliance Integration ---")
            compliance_checker.check_aml_compliance(df_processed)
            compliance_checker.check_kyc_rules(df_processed)

            # Step 4: Deployment and Verification
            print("\n--- Step 4: Deployment and Verification ---")
            deployer.deploy_model()
            deployer.verify_deployment()

            print("\nKYC processing and model deployment pipeline completed successfully.")
        else:
            print("\nNo documents were successfully processed. Please check the logs for details.")
            
    except Exception as e:
        print(f"Error in main processing: {str(e)}")
        return

if __name__ == "__main__":
    main()