import os
import joblib
import pandas as pd
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)
CORS(app)

# Path to the serialized ML model pipeline
MODEL_PATH = os.path.join("models", "salary_model.pkl")
model = None

# Try loading the model on startup
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Successfully loaded the pre-trained salary prediction model.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Warning: Model not found at '{MODEL_PATH}'. Please run the training script first.")

@app.route("/")
def home():
    """Renders the landing/home page."""
    return render_template("index.html")

@app.route("/predict")
def predict_page():
    """Renders the salary prediction form page."""
    return render_template("predict.html")

@app.route("/api/predict", methods=["POST"])
def predict_api():
    """
    API endpoint that accepts JSON data, validates inputs,
    runs the machine learning prediction, and returns the result.
    """
    global model
    
    # Check if model is loaded
    if model is None:
        # Lazy load if it wasn't loaded on startup
        if os.path.exists(MODEL_PATH):
            try:
                model = joblib.load(MODEL_PATH)
            except Exception as e:
                return jsonify({"error": f"Model initialization failed: {str(e)}"}), 500
        else:
            return jsonify({"error": "Machine learning model is not available. Please contact administrator or run training."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided."}), 400
        
        # 1. Extraction of inputs
        name = data.get("name", "").strip()
        age_str = str(data.get("age", "")).strip()
        experience_str = str(data.get("experience", "")).strip()
        education = data.get("education", "").strip()
        role = data.get("role", "").strip()
        
        # 2. Input Validation
        errors = {}
        
        # Name Validation
        if not name:
            errors["name"] = "Name is required."
        elif len(name) < 2:
            errors["name"] = "Name must be at least 2 characters long."
            
        # Age Validation
        try:
            age = int(age_str)
            if age < 21 or age > 65:
                errors["age"] = "Age must be between 21 and 65."
        except ValueError:
            errors["age"] = "Age must be a valid integer."
            age = None
            
        # Years of Experience Validation
        try:
            experience = int(experience_str)
            if experience < 0 or experience > 45:
                errors["experience"] = "Experience must be between 0 and 45 years."
        except ValueError:
            errors["experience"] = "Experience must be a valid integer."
            experience = None
            
        # Logical Cross-Validation (Age vs Experience)
        if age is not None and experience is not None:
            # Assumes starting work no earlier than 18 years old
            if experience > (age - 18):
                errors["experience"] = f"Experience cannot exceed {age - 18} years for an age of {age}."
                
        # Education Validation
        valid_educations = ["Bachelor's", "Master's", "PhD"]
        if education not in valid_educations:
            errors["education"] = f"Invalid education choice. Select from {', '.join(valid_educations)}."
            
        # Job Role Validation
        valid_roles = [
            "Software Engineer",
            "Senior Software Engineer",
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Python Developer",
            "Java Developer",
            "Data Scientist",
            "Machine Learning Engineer",
            "AI Engineer",
            "Data Analyst",
            "Business Analyst",
            "Cloud Engineer",
            "DevOps Engineer",
            "QA Engineer",
            "Test Engineer",
            "UI Designer",
            "UX Designer",
            "UI/UX Designer",
            "Android Developer",
            "iOS Developer",
            "Cyber Security Analyst",
            "Network Engineer",
            "System Administrator",
            "Database Administrator",
            "Product Manager",
            "Project Manager",
            "HR Executive",
            "Accountant",
            "Marketing Executive",
            "Sales Executive",
            "Graphic Designer",
            "Content Writer",
            "Customer Support Executive",
            "Operations Manager",
            "Finance Analyst",
            "Research Engineer",
            "Embedded Engineer",
            "Mechanical Engineer",
            "Civil Engineer",
            "Electrical Engineer"
        ]
        if role not in valid_roles:
            errors["role"] = f"Invalid job role choice. Please select from the autocomplete suggestions."
            
        if errors:
            return jsonify({"errors": errors}), 400
            
        # 3. Model Inference
        # Format matching the training features: Age, Education, Years_of_Experience, Job_Role
        input_data = pd.DataFrame([{
            "Age": age,
            "Education": education,
            "Years_of_Experience": experience,
            "Job_Role": role
        }])
        
        # Run prediction
        predicted_annual = float(model.predict(input_data)[0])
        
        # Post-process results
        # Ensure predicted salary is not below a reasonable minimum due to model variation
        predicted_annual = max(240000.0, round(predicted_annual, -3)) # Round to nearest 1000 (INR)
        predicted_monthly = round(predicted_annual / 12.0, 2)
        
        return jsonify({
            "success": True,
            "name": name,
            "predicted_annual": predicted_annual,
            "predicted_monthly": predicted_monthly,
            "input_summary": {
                "age": age,
                "education": education,
                "experience": experience,
                "role": role
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"An unexpected backend error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    # Standard Flask development port
    app.run(debug=True, host="127.0.0.1", port=5000)
