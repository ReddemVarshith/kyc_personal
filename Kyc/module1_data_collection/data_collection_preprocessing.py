import os
import pandas as pd
import cv2
import re
import logging
from datetime import datetime
from PIL import Image, ImageDraw
import pytesseract
# from transformers import pipeline

class DataProcessor:
    def __init__(self, data_dir="c:\\Users\\91830\\Desktop\\Kyc\\data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Set up logging
        log_dir = os.path.join(data_dir, "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, f"kyc_processing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info("DataProcessor initialized")

    def gather_documents(self, document_paths):
        """
        Gathers documents from specified paths.
        """
        try:
            self.logger.info(f"Gathering documents from: {document_paths}")
            valid_paths = [path for path in document_paths if os.path.exists(path)]
            self.logger.info(f"Found {len(valid_paths)} valid document paths")
            return valid_paths
        except Exception as e:
            self.logger.error(f"Error gathering documents: {str(e)}")
            return []

    def standardize_document_format(self, image_path, output_path, target_format='PNG'):
        """
        Standardizes document images to a target format (e.g., PNG).
        """
        try:
            self.logger.info(f"Standardizing document format: {image_path} -> {output_path}")
            img = Image.open(image_path)
            img.save(output_path, format=target_format)
            self.logger.info(f"Successfully standardized document to {target_format}")
            return output_path
        except Exception as e:
            self.logger.error(f"Error standardizing document {image_path}: {str(e)}")
            return None

    def deskew_image(self, image):
        try:
            self.logger.debug("Starting image deskewing")
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image

            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 5))
            dilated = cv2.dilate(gray, kernel, iterations=1)

            contours, _ = cv2.findContours(dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)

            if contours:
                largest_contour = contours[0]
                min_rect = cv2.minAreaRect(largest_contour)
                angle = min_rect[-1]

                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle

                (h, w) = image.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                self.logger.debug(f"Image deskewed by {angle:.2f} degrees")
                return rotated
            
            self.logger.warning("No contours found for deskewing")
            return image
        except Exception as e:
            self.logger.error(f"Error during image deskewing: {str(e)}")
            return image

    def preprocess_image(self, image_path):
        """
        Applies image preprocessing techniques to enhance OCR accuracy.
        """
        try:
            self.logger.info(f"Starting image preprocessing for {image_path}")
            img = cv2.imread(image_path)
            if img is None:
                self.logger.error(f"Could not open or find the image at {image_path}")
                return None

            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            self.logger.debug("Converted image to grayscale")

            # Deskew the image
            deskewed = self.deskew_image(gray)
            self.logger.debug("Applied deskewing")

            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(deskewed, (5, 5), 0)
            self.logger.debug("Applied Gaussian blur")

            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            self.logger.debug("Applied adaptive thresholding")

            # Convert back to RGB
            rgb = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)

            # Save preprocessed image
            preprocessed_image_path = image_path.replace(".png", "_preprocessed.png").replace(".jpg", "_preprocessed.jpg")
            cv2.imwrite(preprocessed_image_path, rgb)
            self.logger.info(f"Preprocessed image saved to: {preprocessed_image_path}")
            return preprocessed_image_path
        except Exception as e:
            self.logger.error(f"Error during image preprocessing: {str(e)}")
            return None

    def extract_text_from_document(self, image_path):
        """
        Extracts all text from a document image using OCR.
        """
        try:
            self.logger.info(f"Starting OCR text extraction from {image_path}")
            
            # First try with default settings
            extracted_text = pytesseract.image_to_string(Image.open(image_path), config='--psm 6 --oem 3')
            
            # If text extraction failed or produced poor results, try with different settings
            if not extracted_text.strip():
                self.logger.warning("Initial OCR attempt produced no text, trying alternative settings")
                # Try with different PSM modes
                for psm in [3, 4, 1]:
                    extracted_text = pytesseract.image_to_string(Image.open(image_path), config=f'--psm {psm} --oem 3')
                    if extracted_text.strip():
                        self.logger.info(f"Successfully extracted text using PSM mode {psm}")
                        break
            
            if not extracted_text.strip():
                self.logger.error("OCR failed to extract any text")
                return ""
            
            self.logger.info(f"Successfully extracted {len(extracted_text)} characters of text")
            return extracted_text
        except Exception as e:
            self.logger.error(f"Error during OCR text extraction: {str(e)}")
            return ""

    def preprocess_address_data(self, full_text):
        """
        Preprocesses the extracted text to isolate and clean the address information.
        """
        try:
            self.logger.info("Starting address preprocessing")
            
            # Define address pattern
            address_pattern = re.compile(
                r"(?:['']?Address|Addr|Add)\s*[:]?\s*"
                r"([a-zA-Z0-9.,\s\-/#]+?)"
                r"(?:\s*(?:Father's Name|Fathers Name|PIN|Date of Birth|Gender|Name)|$)",
                re.IGNORECASE | re.DOTALL
            )

            match = address_pattern.search(full_text)
            if match:
                extracted_address = match.group(1).strip()
                self.logger.debug(f"Found address match: {extracted_address}")
            else:
                self.logger.warning("No address pattern found in text")
                extracted_address = ""

            cleaned_address = extracted_address

            self.logger.debug(f"Original address text: {cleaned_address}")
            
            # Remove common extraneous phrases and labels
            cleaning_patterns = [
                (r"Gender\s*:\s*[A-Za-z]+\s*", "Gender label"),
                (r"Address\s*:\s*", "Address label"),
                (r"Date of Birth\s*:\s*[0-9/]+\s*", "DOB label"),
                (r"Name\s*:\s*[A-Za-z\s]+\s*", "Name label"),
                (r"Father's Name\s*:\s*[A-Za-z\s]+\s*", "Father's Name label"),
                (r"PIN\s*:\s*\d{6}\s*", "PIN label"),
                (r"Government of India|Aadhaar", "Document header"),
                (r"^[''\s]+", "Leading apostrophes/spaces")
            ]
            
            for pattern, label in cleaning_patterns:
                old_address = cleaned_address
                cleaned_address = re.sub(pattern, "", cleaned_address, flags=re.IGNORECASE)
                if old_address != cleaned_address:
                    self.logger.debug(f"Removed {label}")

            # Remove extra spaces and convert to uppercase
            cleaned_address = " ".join(cleaned_address.split()).upper()
            self.logger.info(f"Successfully preprocessed address: {cleaned_address}")
            return cleaned_address
        except Exception as e:
            self.logger.error(f"Error preprocessing address data: {str(e)}")
            return ""

    def anonymize_data(self, text):
        """Anonymize sensitive information in the text."""
        try:
            self.logger.info("Starting data anonymization")
            anonymized_text = text

            # Simple regex patterns that focus on basic matching
            patterns = {
                'name': r'(?i)Name\s*:?\s*([^\n]+)',
                'dob': r'(?i)(?:Date of Birth|DOB)\s*:?\s*([^\n]+)',
                'gender': r'(?i)Gender\s*:?\s*([^\n]+)',
                'father': r'(?i)(?:Father|Father\'?s Name)\s*:?\s*([^\n]+)',
                'pin': r'(?i)(?:PIN|Pincode)\s*:?\s*(\d[^\n]*)',
                'address': r'(?i)(?:Address|Add)\s*:?\s*([^\n]+)'
            }

            # Replace each pattern with anonymized version
            for field, pattern in patterns.items():
                old_text = anonymized_text
                replacement = f'\\1: [{field.upper()}_ANONYMIZED]'
                anonymized_text = re.sub(pattern, replacement, anonymized_text)
                if old_text != anonymized_text:
                    self.logger.debug(f"Anonymized {field} field")

            self.logger.info("Data anonymization completed")
            return anonymized_text
        except Exception as e:
            self.logger.error(f"Error during data anonymization: {str(e)}")
            return text

    def validate_extracted_data(self, data):
        """
        Validates extracted data against predefined rules.
        Returns a tuple of (is_valid, error_messages).
        """
        try:
            self.logger.info("Starting data validation")
            errors = []
            
            # Check required fields
            required_fields = ['Name', 'Date of Birth', 'Gender', "Father's Name", 'PIN', 'Address']
            for field in required_fields:
                if not re.search(f"{field}\\s*:?\\s*[^\\n]+", data, re.IGNORECASE):
                    errors.append(f"Missing or empty {field} field")
                    self.logger.warning(f"Missing required field: {field}")
            
            # Validate PIN format
            pin_match = re.search(r'PIN\s*:?\s*(\d+)', data, re.IGNORECASE)
            if pin_match:
                pin = pin_match.group(1)
                if not re.match(r'^\d{6}$', pin):
                    errors.append(f"Invalid PIN format: {pin} (should be 6 digits)")
                    self.logger.warning(f"Invalid PIN format: {pin}")
            
            # Validate Date of Birth format
            dob_match = re.search(r'Date of Birth\s*:?\s*(\d{2}/\d{2}/\d{4})', data, re.IGNORECASE)
            if dob_match:
                dob = dob_match.group(1)
                try:
                    datetime.strptime(dob, '%d/%m/%Y')
                except ValueError:
                    errors.append(f"Invalid Date of Birth format: {dob} (should be DD/MM/YYYY)")
                    self.logger.warning(f"Invalid DOB format: {dob}")
            
            # Validate Gender
            gender_match = re.search(r'Gender\s*:?\s*(\w+)', data, re.IGNORECASE)
            if gender_match:
                gender = gender_match.group(1).lower()
                if gender not in ['male', 'female', 'other']:
                    errors.append(f"Invalid Gender value: {gender}")
                    self.logger.warning(f"Invalid gender value: {gender}")
            
            # Validate Address length
            address_match = re.search(r'Address\s*:?\s*([^\n]+)', data, re.IGNORECASE)
            if address_match:
                address = address_match.group(1)
                if len(address.split()) < 3:
                    errors.append("Address is too short")
                    self.logger.warning("Address is too short (less than 3 words)")
            
            is_valid = len(errors) == 0
            if is_valid:
                self.logger.info("Data validation passed")
            else:
                self.logger.warning(f"Data validation failed with {len(errors)} errors")
            
            return is_valid, errors
        except Exception as e:
            self.logger.error(f"Error during data validation: {str(e)}")
            return False, [f"Validation error: {str(e)}"]

    def process_document(self, input_path):
        """
        Main function to process KYC documents. Can handle both individual files and directories.
        """
        try:
            self.logger.info(f"Starting document processing for: {input_path}")
            processed_data = []
            
            # Handle both individual files and directories
            if os.path.isfile(input_path):
                document_paths = [input_path]
                self.logger.debug("Processing single file")
            else:
                document_paths = [os.path.join(input_path, f) for f in os.listdir(input_path) 
                                if os.path.isfile(os.path.join(input_path, f))]
                self.logger.debug(f"Processing directory with {len(document_paths)} files")

            for doc_path in document_paths:
                try:
                    if not os.path.exists(doc_path):
                        self.logger.warning(f"Document not found: {doc_path}. Skipping.")
                        continue

                    self.logger.info(f"Processing document: {doc_path}")

                    # Step 1: Standardize document format
                    base_name = os.path.basename(doc_path)
                    name, ext = os.path.splitext(base_name)
                    standardized_path = os.path.join(self.data_dir, f"{name}.png")
                    
                    standardized_doc = self.standardize_document_format(doc_path, standardized_path)
                    if not standardized_doc:
                        self.logger.error(f"Failed to standardize document: {doc_path}")
                        continue

                    # Extract text from the standardized document
                    extracted_text = self.extract_text_from_document(standardized_doc)
                    
                    # Validate extracted data
                    is_valid, validation_errors = self.validate_extracted_data(extracted_text)
                    if not is_valid:
                        self.logger.warning(f"Validation errors for {doc_path}:")
                        for error in validation_errors:
                            self.logger.warning(f"  - {error}")
                    
                    # Preprocess address data
                    preprocessed_address = self.preprocess_address_data(extracted_text)

                    # Anonymize sensitive data
                    anonymized_text = self.anonymize_data(extracted_text)

                    processed_data.append({
                        "document_path": doc_path,
                        "standardized_path": standardized_doc,
                        "extracted_text": extracted_text,
                        "anonymized_text": anonymized_text,
                        "preprocessed_address": preprocessed_address,
                        "validation_passed": is_valid,
                        "validation_errors": validation_errors if not is_valid else []
                    })
                    self.logger.info(f"Successfully processed document: {doc_path}")
                except Exception as e:
                    self.logger.error(f"Error processing document {doc_path}: {str(e)}")
                    continue
            
            df = pd.DataFrame(processed_data)
            self.logger.info(f"Completed processing {len(df)} documents")
            return df
        except Exception as e:
            self.logger.error(f"Error processing path {input_path}: {str(e)}")
            return pd.DataFrame()

if __name__ == "__main__":
    processor = DataProcessor()
    
    # Process the documents from the input directory
    input_document_dir = os.path.join(os.getcwd(), "data", "raw_documents")
    df_processed = processor.process_document(input_document_dir)
    print("\n--- Processed Data Summary ---")
    print(df_processed)

    # Save processed data to a CSV file
    output_csv_path = os.path.join(processor.data_dir, "processed_kyc_data.csv")
    df_processed.to_csv(output_csv_path, index=False)
    print(f"\nProcessed data saved to: {output_csv_path}")