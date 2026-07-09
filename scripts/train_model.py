import os
import random
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Ensure output directories exist
os.makedirs("data", exist_ok=True)
os.makedirs("models", exist_ok=True)

# 1. Generate Synthetic Dataset
def generate_synthetic_data(num_samples=1500):
    print("Generating synthetic employee dataset...")
    
    first_names = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "James", "Jessica", "Robert", "Ashley", 
                   "William", "Amanda", "Joseph", "Melissa", "Chris", "Stephanie", "Matthew", "Nicole", "Daniel", "Elizabeth"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", 
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    
    roles = ["Software Engineer", "Data Scientist", "Product Manager", "Analyst", "Designer"]
    educations = ["Bachelor's", "Master's", "PhD"]
    
    data = []
    
    # Set random seed for reproducibility
    random.seed(42)
    np.random.seed(42)
    
    for _ in range(num_samples):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        
        # Age distribution (21 to 60)
        age = int(np.random.randint(21, 61))
        
        # Max experience depends on age (approx age - 21)
        max_exp = max(0, age - 21)
        experience = int(np.random.randint(0, max_exp + 1))
        
        # Role and Education
        role = random.choice(roles)
        # Education probabilities (more experienced people tend to have higher degrees sometimes, but let's keep it simple)
        education = np.random.choice(educations, p=[0.6, 0.3, 0.1])
        
        # Salary Calculation Logic (Realistic base salary in INR + multipliers + random noise)
        base_salary = 350000
        
        # Job Role Multipliers
        role_multipliers = {
            "Software Engineer": 1.5,
            "Data Scientist": 1.6,
            "Product Manager": 1.55,
            "Analyst": 1.0,
            "Designer": 1.2
        }
        role_mult = role_multipliers[role]
        
        # Education bonuses
        edu_bonuses = {
            "Bachelor's": 0,
            "Master's": 150000,
            "PhD": 350000
        }
        edu_bonus = edu_bonuses[education]
        
        # Experience component
        # Standard: +₹50000 per year of experience, with a slight diminishing return for very high experience
        exp_bonus = (experience * 50000) - (experience ** 1.5 * 1000)
        
        # Age bonus (small general maturity bonus)
        age_bonus = max(0, (age - 21) * 5000)
        
        # Calculate expected salary
        expected_salary = (base_salary * role_mult) + exp_bonus + edu_bonus + age_bonus
        
        # Add random noise (representing negotiation, company size, location, etc.)
        noise = np.random.normal(0, 40000)
        final_salary = int(expected_salary + noise)
        
        # Bound salary to a reasonable minimum
        final_salary = max(240000, final_salary)
        
        data.append({
            "Name": name,
            "Age": age,
            "Education": education,
            "Years_of_Experience": experience,
            "Job_Role": role,
            "Salary": final_salary
        })
        
    df = pd.DataFrame(data)
    df.to_csv("data/employee_salaries.csv", index=False)
    print(f"Dataset generated and saved to 'data/employee_salaries.csv'. Total records: {len(df)}")
    return df

# 2. Train ML Model Pipeline
def train_model(df):
    print("Training ML model pipeline...")
    
    # Split features and target
    # Note: Name is identifier, not a predictor, so we drop it
    X = df[["Age", "Education", "Years_of_Experience", "Job_Role"]]
    y = df["Salary"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define Column Transformer for pre-processing
    categorical_features = ["Education", "Job_Role"]
    numerical_features = ["Age", "Years_of_Experience"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), categorical_features)
        ]
    )
    
    # Create Pipeline
    # Random Forest Regressor is highly suitable for this kind of tabular data
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
        ]
    )
    
    # Train the pipeline
    pipeline.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("--- Model Performance ---")
    print(f"Mean Absolute Error (MAE): ${mae:.2f}")
    print(f"R2 Score: {r2:.4f}")
    print("-------------------------")
    
    # Save the pipeline
    joblib.dump(pipeline, "models/salary_model.pkl")
    print("Trained model pipeline saved successfully to 'models/salary_model.pkl'.")

if __name__ == "__main__":
    df = generate_synthetic_data()
    train_model(df)
