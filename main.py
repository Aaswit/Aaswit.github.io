from bson import ObjectId
from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo
import os
import openai

openai.api_key = os.environ.get("OPENAI_API_KEY")

app = Flask(__name__)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
mongo = PyMongo(app)


@app.route("/payment")
def payment():
    return render_template("payment.html")

@app.route("/")
def home():
    chats = mongo.db.chats.find({})
    myChats = [{"id": str(chat["_id"]), "question": chat["question"], "answer": chat["answer"]} for chat in chats]
    print(myChats)
    return render_template("index.html", myChats=myChats)


@app.route("/api", methods=["POST"])
def chat_with_gpt():
    if request.method == "POST":
        print(request.json)
        question = request.json.get("question")
        chat = mongo.db.chats.find_one({'question': question})
        print(chat)
        if chat:
            data = {"id": str(chat["_id"]), "question": question, "answer": f"{chat['answer']}"}
            return jsonify(data)
        else:
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=question,
                temperature=0.7,
                max_tokens=256,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            print(response)
            data = {"id": None, "question": question, "answer": response["choices"][0]["text"]}
            inserted_id = mongo.db.chats.insert_one({'question': question, 'answer': response["choices"][0]["text"]}).inserted_id
            data["id"] = str(inserted_id)
            return jsonify(data)
    data = {"result": "I am your AI assistant, How can I help you today?"}
    return jsonify(data)


@app.route("/api/edit/<chat_id>", methods=["PUT"])
def edit_chat(chat_id):
    data = request.get_json()
    updated_question = data.get("question")
    if updated_question:
        chat = mongo.db.chats.find_one_and_update(
            {"_id": ObjectId(chat_id)},
            {"$set": {"question": updated_question}},
            return_document=True
        )
        return jsonify(chat)
    return jsonify({"error": "Invalid request"}), 400


@app.route("/api/delete/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    result = mongo.db.chats.delete_one({"_id": ObjectId(chat_id)})
    if result.deleted_count > 0:
        return jsonify({"message": "Chat deleted successfully"})
    return jsonify({"error": "Chat not found"}), 404


@app.route("/api/send_message", methods=["POST"])
def send_message_to_gpt():
    if request.method == "POST":
        data = request.get_json()
        question = data.get("message")
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=question,
            temperature=0.7,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        data = {"answer": response["choices"][0]["text"]}
        return jsonify(data)
    return jsonify({"error": "Invalid request"}), 400


@app.route("/api/regenerate", methods=["POST"])
def regenerate_response():
    if request.method == "POST":
        question = request.json.get("question")
        if question:
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=question,
                temperature=0.7,
                max_tokens=256,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            data = {"answer": response["choices"][0]["text"]}
            return jsonify(data)
    return jsonify({"error": "Invalid request"}), 400


if __name__ == "__main__":
    app.run(debug=True)
