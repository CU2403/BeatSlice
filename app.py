from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    tracks = [
        {'name': 'Drums', 'file': 'drums.mp3'},
        {'name': 'Bass', 'file': 'bass.mp3'},
        {'name': 'Melody', 'file': 'melody.mp3'},
        {'name': 'Vocals', 'file': 'vocals.mp3'}
    ]
    return render_template('index.html', tracks=tracks)

if __name__ == '__main__':
    app.run(debug=True)