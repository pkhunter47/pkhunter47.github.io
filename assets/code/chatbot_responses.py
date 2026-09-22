import random

R_EATING = "I don't eat sir, because I am your personal AI that tries to help you!"
R_WEATHER = "I can't feel the weather, but I hope it's sunny for you!"

def get_joke():
    jokes = [
        "Why did the computer go to art school? Because it wanted to learn how to draw bytes!",
        "Why was the math book sad? Because it had too many problems.",
        "Why don’t programmers like nature? Too many bugs.",
        "I would tell you a UDP joke, but you might not get it.",
        "There are only 10 types of people in the world: those who understand binary and those who don’t."
    ]
    return random.choice(jokes)

def unknown():
    response = [
        'Could you please re-phrase that?',
        "....",
        "Sounds about right",
        "What does that mean?"
    ][random.randrange(4)]
    return response
