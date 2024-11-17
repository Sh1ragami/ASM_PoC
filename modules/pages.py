from flask import Blueprint, render_template

# Blueprintオブジェクトを作成
pages_bp = Blueprint('pages', __name__)

# Blueprintを使ってルートを定義
@pages_bp.route('/')
def index():
    return render_template('scan.html')

@pages_bp.route('/config')
def api():
    return render_template('scan_config.html')

@pages_bp.route('/guide')
def guide():
    return render_template('user_guide.html')

@pages_bp.route('/log')
def history():
    return render_template('scan_log.html')
