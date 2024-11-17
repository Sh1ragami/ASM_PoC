from modules import create_app

# Flask アプリケーションを作成
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
