import os
from datetime import date
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="Generate tailored day-by-day travel plans.",
    version="1.0.0",
)

origins = [x.strip() for x in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_date: date
    end_date: date
    budget: float = Field(gt=0, le=100000000)
    interests: List[str] = Field(default_factory=list, max_length=10)
    travel_style: str = Field(default="balanced", max_length=30)
    group_size: int = Field(default=1, ge=1, le=30)
    currency: str = Field(default="INR", max_length=5)

class Activity(BaseModel):
    time: str
    title: str
    description: str
    category: str
    estimated_cost: float

class ItineraryDay(BaseModel):
    day: int
    date: str
    title: str
    activities: List[Activity]
    estimated_total: float

class TripResponse(BaseModel):
    destination: str
    summary: str
    budget: float
    estimated_total: float
    currency: str
    days: List[ItineraryDay]
    tips: List[str]
    generated_by: str

def make_itinerary(req: TripRequest) -> TripResponse:
    number_of_days = (req.end_date - req.start_date).days + 1
    if number_of_days < 1:
        raise HTTPException(status_code=400, detail="End date must be on or after start date.")
    if number_of_days > 14:
        raise HTTPException(status_code=400, detail="Please choose a trip of 14 days or less.")

    interests = [x.lower() for x in req.interests]
    choices = []
    if any(x in interests for x in ["culture", "history", "temples", "heritage"]):
        choices.append(("Morning", "Explore a heritage or cultural landmark", "Culture", 450))
    if any(x in interests for x in ["food", "local food", "street food"]):
        choices.append(("Lunch", "Try a well-reviewed local food area", "Food", 350))
    if any(x in interests for x in ["nature", "adventure", "hiking", "beaches"]):
        choices.append(("Afternoon", "Visit a nature spot or outdoor attraction", "Nature", 500))
    if any(x in interests for x in ["shopping", "markets"]):
        choices.append(("Evening", "Explore a local market or shopping street", "Shopping", 300))
    if not choices:
        choices = [
            ("Morning", "Explore a popular local attraction", "Sightseeing", 400),
            ("Lunch", "Enjoy regional cuisine", "Food", 350),
            ("Afternoon", "Visit a museum, garden, or scenic area", "Sightseeing", 450),
            ("Evening", "Take a relaxed walk through a lively neighbourhood", "Leisure", 250),
        ]
    else:
        # Keep the plan balanced even if the user selects just one interest.
        choices = choices + [
            ("Lunch", "Enjoy regional cuisine at a local eatery", "Food", 350),
            ("Evening", "Relax and explore the nearby neighbourhood", "Leisure", 250),
        ]

    per_person_factor = max(1, req.group_size)
    daily_cap = req.budget / number_of_days
    days = []
    grand_total = 0.0
    for idx in range(number_of_days):
        activities = []
        daily_total = 0.0
        # Rotate suggestions to avoid repeating the same sequence each day.
        rotated = choices[idx % len(choices):] + choices[:idx % len(choices)]
        for time, title, category, cost in rotated[:4]:
            scaled = round(cost * (1.0 if req.travel_style == "budget" else 1.25 if req.travel_style == "premium" else 1.0), 2)
            activities.append(Activity(
                time=time,
                title=title,
                description=f"Suggested {category.lower()} activity in {req.destination}. Check local opening times, transit, and ticket prices before visiting.",
                category=category,
                estimated_cost=scaled * per_person_factor,
            ))
            daily_total += scaled * per_person_factor
        # Keep total estimates transparent; the budget is a target, not a guarantee.
        day_date = req.start_date.fromordinal(req.start_date.toordinal() + idx).isoformat()
        days.append(ItineraryDay(
            day=idx + 1,
            date=day_date,
            title=f"Day {idx + 1}: {['Discover', 'Explore', 'Enjoy', 'Experience'][idx % 4]} {req.destination}",
            activities=activities,
            estimated_total=round(daily_total, 2),
        ))
        grand_total += daily_total

    return TripResponse(
        destination=req.destination,
        summary=f"A {number_of_days}-day {req.travel_style} trip to {req.destination} for {req.group_size} traveller(s), shaped around {', '.join(req.interests) if req.interests else 'general sightseeing'}.",
        budget=req.budget,
        estimated_total=round(grand_total, 2),
        currency=req.currency,
        days=days,
        tips=[
            "Confirm opening hours and ticket requirements from official sources.",
            "Keep a little buffer for local transport, meals, and unexpected costs.",
            "Group nearby attractions together to reduce travel time.",
            "Prices are estimates, not live quotes or reservations.",
        ],
        generated_by="local-demo-generator",
    )

@app.get("/")
def root():
    return {"message": "Travel Planner API is running", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/itineraries/generate", response_model=TripResponse)
def generate_itinerary(req: TripRequest):
    if req.end_date < req.start_date:
        raise HTTPException(status_code=400, detail="End date must be on or after start date.")
    return make_itinerary(req)
