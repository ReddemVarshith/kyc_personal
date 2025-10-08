import os
import pandas as pd
import logging
from datetime import datetime
from tqdm import tqdm
from module1_data_collection.data_collection_preprocessing import DataProcessor

class BatchProcessor:
    def __init__(self, data_dir="c:\\Users\\91830\\Desktop\\Kyc\\data", batch_size=5):
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.data_processor = DataProcessor(data_dir)
        
        # Set up logging
        log_dir = os.path.join(data_dir, "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, f"batch_processing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"BatchProcessor initialized with batch size: {batch_size}")

    def get_document_batches(self, input_dir):
        """
        Split documents into batches for processing.
        """
        try:
            self.logger.info(f"Getting document batches from {input_dir}")
            all_files = [f for f in os.listdir(input_dir) 
                        if os.path.isfile(os.path.join(input_dir, f)) and 
                        (f.lower().startswith('aadhaar_') or f.lower().startswith('aadhar_')) and
                        (f.lower().endswith('.jpg') or f.lower().endswith('.png'))]
            
            # Split files into batches
            batches = [all_files[i:i + self.batch_size] for i in range(0, len(all_files), self.batch_size)]
            self.logger.info(f"Created {len(batches)} batches from {len(all_files)} documents")
            return batches
        except Exception as e:
            self.logger.error(f"Error creating document batches: {str(e)}")
            return []

    def process_batch(self, batch_files, input_dir):
        """
        Process a batch of documents.
        """
        try:
            self.logger.info(f"Processing batch of {len(batch_files)} documents")
            processed_data = []
            
            for file_name in batch_files:
                try:
                    file_path = os.path.join(input_dir, file_name)
                    self.logger.debug(f"Processing file: {file_path}")
                    
                    # Process individual document
                    result = self.data_processor.process_document(file_path)
                    if not result.empty:
                        processed_data.append(result)
                        self.logger.debug(f"Successfully processed {file_path}")
                    else:
                        self.logger.warning(f"No data extracted from {file_path}")
                except Exception as e:
                    self.logger.error(f"Error processing file {file_name}: {str(e)}")
                    continue
            
            # Combine results from batch
            if processed_data:
                batch_df = pd.concat(processed_data, ignore_index=True)
                self.logger.info(f"Successfully processed batch with {len(batch_df)} documents")
                return batch_df
            else:
                self.logger.warning("No data processed in this batch")
                return pd.DataFrame()
        except Exception as e:
            self.logger.error(f"Error processing batch: {str(e)}")
            return pd.DataFrame()

    def process_all_documents(self, input_dir):
        """
        Process all documents in batches with progress tracking.
        """
        try:
            self.logger.info(f"Starting batch processing of documents in {input_dir}")
            all_processed_data = []
            
            # Get document batches
            batches = self.get_document_batches(input_dir)
            if not batches:
                self.logger.error("No valid documents found for processing")
                return pd.DataFrame()
            
            # Process batches with progress bar
            with tqdm(total=len(batches), desc="Processing document batches") as pbar:
                for batch_idx, batch_files in enumerate(batches, 1):
                    self.logger.info(f"Processing batch {batch_idx}/{len(batches)}")
                    batch_df = self.process_batch(batch_files, input_dir)
                    
                    if not batch_df.empty:
                        all_processed_data.append(batch_df)
                        self.logger.info(f"Batch {batch_idx} completed: {len(batch_df)} documents processed")
                    
                    # Save intermediate results
                    if all_processed_data:
                        intermediate_df = pd.concat(all_processed_data, ignore_index=True)
                        intermediate_path = os.path.join(self.data_dir, f"processed_data_batch_{batch_idx}.csv")
                        intermediate_df.to_csv(intermediate_path, index=False)
                        self.logger.info(f"Saved intermediate results to {intermediate_path}")
                    
                    pbar.update(1)
            
            # Combine all results
            if all_processed_data:
                final_df = pd.concat(all_processed_data, ignore_index=True)
                self.logger.info(f"Completed processing all documents: {len(final_df)} total documents processed")
                return final_df
            else:
                self.logger.warning("No documents were successfully processed")
                return pd.DataFrame()
        except Exception as e:
            self.logger.error(f"Error during batch processing: {str(e)}")
            return pd.DataFrame()

    def export_results(self, df, output_format='csv'):
        """
        Export processed data in various formats.
        """
        try:
            if df.empty:
                self.logger.warning("No data to export")
                return None
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            if output_format.lower() == 'csv':
                output_path = os.path.join(self.data_dir, f"kyc_processed_data_{timestamp}.csv")
                df.to_csv(output_path, index=False)
                self.logger.info(f"Data exported to CSV: {output_path}")
                return output_path
            
            elif output_format.lower() == 'excel':
                output_path = os.path.join(self.data_dir, f"kyc_processed_data_{timestamp}.xlsx")
                df.to_excel(output_path, index=False)
                self.logger.info(f"Data exported to Excel: {output_path}")
                return output_path
            
            elif output_format.lower() == 'json':
                output_path = os.path.join(self.data_dir, f"kyc_processed_data_{timestamp}.json")
                df.to_json(output_path, orient='records', lines=True)
                self.logger.info(f"Data exported to JSON: {output_path}")
                return output_path
            
            else:
                self.logger.error(f"Unsupported output format: {output_format}")
                return None
        except Exception as e:
            self.logger.error(f"Error exporting results: {str(e)}")
            return None

if __name__ == "__main__":
    # Initialize batch processor with batch size of 5
    batch_processor = BatchProcessor(batch_size=5)
    
    # Process all documents in the input directory
    input_dir = os.path.join(os.getcwd(), "data", "raw_documents")
    processed_df = batch_processor.process_all_documents(input_dir)
    
    # Export results in different formats
    if not processed_df.empty:
        batch_processor.export_results(processed_df, 'csv')
        batch_processor.export_results(processed_df, 'excel')
        batch_processor.export_results(processed_df, 'json')