from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI(title="Disaster Rescue AI Suggestion Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SuggestionRequest(BaseModel):
    location: str
    disaster_type: str

class SuggestionResponse(BaseModel):
    suggestions: list[str]

@app.get("/")
async def root():
    return {"status": "ML Backend is running"}

@app.post("/api/suggest", response_model=SuggestionResponse)
async def get_suggestions(request: SuggestionRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        # Fallback to offline mode for demo purposes if key is missing
        print("Warning: No API Key found, returning fallback suggestions")
        return SuggestionResponse(suggestions=[
            f"Immediately seek shelter in a designated safe zone for {request.disaster_type}.",
            "Keep an emergency kit ready with water, non-perishable food, and first-aid supplies.",
            "Monitor local news and weather reports for real-time updates.",
            "Ensure all family members are accounted for and have a communication plan.",
            "Avoid using elevators and stay away from windows or glass structures.",
            "Follow all evacuation orders issued by local authorities without delay."
        ])

    try:
        # Initialize Gemini model
        llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=api_key,
            temperature=0.3 # Lower temperature for more consistent formatting
        )

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert disaster management consultant."),
            ("user", "Provide exactly 6 brief, actionable safety suggestions for a {disaster_type} situation in {location}. Return ONLY the 6 suggestions as a simple list, one per line. Do not number them. Do not include introductory text.")
        ])

        # Create chain
        chain = prompt | llm | StrOutputParser()

        # Execute chain
        result = await chain.ainvoke({
            "disaster_type": request.disaster_type,
            "location": request.location
        })

        # Process result into a list
        suggestions = [
            line.strip().lstrip('-•* ').strip() 
            for line in result.split('\n') 
            if line.strip()
        ][:6] # Strictly limit to 6
        
        # Ensure we have suggestions
        if not suggestions:
            suggestions = ["Follow local authority instructions immediately."]

        return SuggestionResponse(suggestions=suggestions)

    except Exception as e:
        print(f"Error generating suggestions: {e}")
        # Return fallback instead of 500 error to keep UI working
        return SuggestionResponse(suggestions=[
            "Enable push notifications for local emergency alerts.",
            "Prepare a 'Go Bag' with essential documents and medicines.",
            "Identify the nearest emergency exit and shelter locations.",
            "establish a meeting point for family members in case of separation.",
            "Keep portable chargers and batteries for communication devices.",
            "Follow official government channels for the latest safety status."
        ])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
