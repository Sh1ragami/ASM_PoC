from flask import Flask, Blueprint, jsonify, send_from_directory
from datetime import datetime
import os

# Blueprint の作成
log_bp = Blueprint('log', __name__)

# output_files ディレクトリのパスを絶対パスに変更
OUTPUT_DIR = os.path.abspath('./output_files')  # 相対パスを絶対パスに変換
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 出力ファイルのリストを取得するエンドポイント
@log_bp.route('/list_output_files', methods=['GET'])
def list_output_files():
    try:
        files = os.listdir(OUTPUT_DIR)
        files = [f for f in files if os.path.isfile(os.path.join(OUTPUT_DIR, f))]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": f"エラーが発生しました: {str(e)}"}), 500

# ファイルの内容を取得して表示するエンドポイント
@log_bp.route('/view_file/<filename>', methods=['GET'])
def view_file(filename):
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        # ファイルの存在を確認
        if not os.path.isfile(file_path):
            return jsonify({"error": "ファイルが存在しません"}), 404
        
        # ファイル内容を読み込む
        with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()
        
        return jsonify({"content": file_content})
    except Exception as e:
        return jsonify({"error": f"ファイルの取得中にエラーが発生しました: {str(e)}"}), 500

# Flask Blueprint を登録
app = Flask(__name__)
app.register_blueprint(log_bp)

if __name__ == '__main__':
    app.run(debug=True)
