from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'replace-with-a-secure-secret'

# Quiz 正确答案映射
CORRECT = {
    '1': 'b',
    '2': 'c',
    '3': 'a',
    '4': 'a',
    '5': 'b',
}

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

# 动态注册 learn1–learn7
for i in range(1, 8):
    def make_learn(step):
        def learn_page():
            return render_template(f'learn{step}.html')
        learn_page.__name__ = f'learn{step}_view'
        app.add_url_rule(f'/learn{step}', endpoint=f'learn{step}', view_func=learn_page)
    make_learn(i)

@app.route('/learn_complete')
def learn_complete():
    return render_template('learn_complete.html')

# Quiz 1–5
@app.route('/quiz/<int:step>', methods=['GET', 'POST'])
def quiz(step):
    # 限制范围
    if step < 1 or step > 5:
        return redirect(url_for('quiz', step=1))

    if 'answers' not in session:
        session['answers'] = {}

    feedback = {}
    if request.method == 'POST':
        choice = request.form.get('choice')
        session['answers'][str(step)] = choice
        session.modified = True
        feedback[str(step)] = 'correct' if choice == CORRECT[str(step)] else 'incorrect'

    # Pass the correct answer into the template
    correct_answer = CORRECT[str(step)]

    return render_template(
        f'quiz{step}.html',
        step=step,
        total=5,
        answers=session['answers'],
        feedback=feedback,
        correct_answer=correct_answer
    )

@app.route('/quiz_result')
def quiz_result():
    answers = session.get('answers', {})
    score = sum(1 for q,a in answers.items() if CORRECT.get(q)==a)
    session.pop('answers', None)
    return render_template('quiz_result.html', score=score, total=5)

if __name__ == '__main__':
    app.run(debug=True)
