import os
from flask import Blueprint, send_from_directory, jsonify

# Blueprintオブジェクトを作成
download_bp = Blueprint('download', __name__)

# 出力ファイル保存用ディレクトリの指定
OUTPUT_DIR = './output_files'

@download_bp.route('/download/<filename>')
def download_file(filename):
    try:
        # ファイルが存在するか確認
        file_path = os.path.join(OUTPUT_DIR, filename)
        if not os.path.isfile(file_path):
            return jsonify({"error": "ファイルが見つかりません"}), 404
        # ファイルを送信
        return send_from_directory(OUTPUT_DIR, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"予期しないエラーが発生しました: {str(e)}"}), 500

@download_bp.route('/latest_output', methods=['GET'])
def latest_output():
    try:
        # 出力ディレクトリ内のすべてのファイルを取得
        files = os.listdir(OUTPUT_DIR)

        # ファイルが存在しない場合
        if not files:
            return jsonify({"error": "出力ファイルが存在しません"}), 404

        # 出力ファイルの中で最新のものを選択
        latest_file = max(files, key=lambda x: os.path.getmtime(os.path.join(OUTPUT_DIR, x)))

        # 最新のファイルのパスを返す
        file_path = os.path.join(OUTPUT_DIR, latest_file)
        return jsonify({"latest_file": latest_file, "file_path": file_path})
    except Exception as e:
        return jsonify({"error": f"予期しないエラーが発生しました: {str(e)}"}), 500
