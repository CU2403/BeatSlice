from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import json, time, os

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

with open('data/pages.json') as f:
    pages = json.load(f)

@app.route('/')
def home():
    session.clear()
    return render_template('home.html')

@app.route('/learn/<int:page>')
def learn(page):
    session.setdefault('learn_times', []).append({'page': page, 'ts': time.time()})
    total = len(pages['learn'])
    if page < 1 or page > total:
        return redirect(url_for('home'))
    data = pages['learn'][page-1]
    return render_template('learn.html', page=page, total_pages=total, data=data, is_last=(page==total))

@app.route('/quiz/<int:page>')
def quiz(page):
    session.setdefault('quiz_times', []).append({'page': page, 'ts': time.time()})
    total = len(pages['quiz'])
    if page < 1 or page > total:
        return redirect(url_for('home'))
    q = pages['quiz'][page-1]
    prev = next((a for a in session.get('quiz_answers',[]) if a['page']==page), None)
    return render_template('quiz.html', page=page, total_pages=total, question=q,
                           selected=(prev['answer'] if prev else None),
                           correct=(prev['correct'] if prev else None),
                           is_last=(page==total))

@app.route('/submit_quiz/<int:page>', methods=['POST'])
def submit_quiz(page):
    ans = request.form.get('answer')
    correct = (ans == pages['quiz'][page-1]['answer'])
    arr = session.setdefault('quiz_answers', [])
    # replace or append
    for i in range(len(arr)):
        if arr[i]['page']==page:
            arr[i]={'page':page,'answer':ans,'correct':correct}
            break
    else:
        arr.append({'page':page,'answer':ans,'correct':correct})
    session['quiz_answers']=arr
    return jsonify(correct=correct)

@app.route('/result')
def result():
    ans = session.get('quiz_answers',[])
    score = sum(1 for a in ans if a['correct'])
    return render_template('result.html', score=score, total=len(pages['quiz']))

@app.route('/visualization')
def visualization():
    # scan static/audio for .mp3 files
    audio_dir = os.path.join(app.static_folder, 'audio')
    tracks = []
    for fn in os.listdir(audio_dir):
        if fn.lower().endswith('.mp3'):
            name = os.path.splitext(fn)[0].replace('_',' ').title()
            tracks.append({'name': name, 'file': fn})
    return render_template('visualization.html', tracks=tracks)

if __name__=='__main__':
    app.run(debug=True)