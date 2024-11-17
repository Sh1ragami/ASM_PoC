from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')  # テンプレートのパスを指定
    CORS(app)

    # Blueprintやルートをインポートし、登録
    from modules.pages import pages_bp
    from modules.bbot_runner import bbot_bp
    from modules.download import download_bp
    from modules.yaml_handler import yaml_bp
    from modules.log import log_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(bbot_bp)
    app.register_blueprint(download_bp)
    app.register_blueprint(yaml_bp)
    app.register_blueprint(log_bp)

    return app

