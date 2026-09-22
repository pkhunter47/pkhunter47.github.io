import re
import long_responses as long


def message_probability(user_message, recognised_words, single_response = False, required_words = []):
    message_certainty=0
    has_required_words=True

    for word in user_message:
        if word in recognised_words:
            message_certainty +=1

    percentage=float(message_certainty)/float(len(recognised_words))

    for word in required_words:
        if word not in user_message:
            has_required_words =False
            break

    if has_required_words or single_response:
        return int(percentage*100)
    else:
        return 0

def check_all_messages(message):
    hishest_prob_list={}

    def response(bot_response, list_of_words, single_response = False, required_words = []):
        nonlocal hishest_prob_list
        hishest_prob_list[bot_response]=message_probability(message, list_of_words, single_response, required_words)   


    #Response ----------------------------------------------------------------------------  
    response('Hello sir!', ['hello','hi','sup','hey','heyo'], single_response = True)
    response('I\'m doing fine sir!', ['how', 'are', 'you', 'doing', 'going', 'feeling'], required_words=['how'])
    response('Thank you!',['i','love','code','palace','great'],required_words=['code','palace','great'])
    response('You\'re welcome sir!', ['thank', 'thanks', 'thankyou'], single_response=True)
    response('No problem at all!', ['no', 'problem'], required_words=['no', 'problem'])
    response('I am your helpful assistant, powered by simple Python!', ['who', 'are', 'you'], required_words=['who'])
    response('I am an AI bot created to help you.', ['what', 'are', 'you'], required_words=['what'])
    response('I don\'t have feelings sir, but I\'m here to help you.', ['how', 'are', 'you', 'feeling'], required_words=['how', 'feeling'])
    response('I feel smart, since I was created to assist you!', ['how', 'do', 'you', 'feel'], required_words=['feel'])
    response('You can call me ChatBot, sir!', ['what', 'your', 'name','call'], required_words=['your', 'name'])
    response('I cannot check the time, but your system clock can!', ['what', 'time', 'now'], required_words=['time'])
    response('Goodbye sir!', ['bye', 'goodbye', 'see', 'later'], single_response=True)
    response('Take care!', ['see', 'you'], required_words=['see', 'you'])
    response('Have a great day ahead!', ['have', 'great', 'day'], required_words=['great', 'day'])
    response('Of course! How can I assist you today?', ['help', 'me'], required_words=['help'])
    response('Python is a great language! Do you need help with it?', ['what', 'is', 'python'], required_words=['python'])
    response('C++ is a powerful language, especially for system-level programming.', ['what', 'is', 'c++'], required_words=['c++'])
    response('Thank you sir!', ['you', 'nice', 'great', 'amazing', 'awesome'], single_response=True)
    response('I dont have a physical form, but I exist in the digital realm!', ['what', 'are', 'you', 'made', 'of'], required_words=['what', 'made'])





    response(long.R_EATING, ['what','you','eat'], required_words=['you','eat'])
    response(long.R_WEATHER, ['weather', 'today'], required_words=['weather'])
    response(long.get_joke(), ['joke'], required_words=['joke'])





    best_match = max(hishest_prob_list, key= hishest_prob_list.get)
    #print(hishest_prob_list)


    return long.unknown() if hishest_prob_list[best_match] < 1 else best_match
                   


def get_responsses(user_input):
    split_message=re.split(r'\s+|[,;?!.-]\s*', user_input.lower())
    respons=check_all_messages(split_message)
    return respons

while True:
    print('Bot: '+ get_responsses(input('You: ')))
