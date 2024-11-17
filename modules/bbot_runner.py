import os
import json
import subprocess
from datetime import datetime
from flask import Blueprint, request, jsonify, send_from_directory

bbot_bp = Blueprint('bbot_runner', __name__)

# 出力用ディレクトリのパス（絶対パス）
OUTPUT_DIR = os.path.abspath('./output_files')
JSON_DIR = os.path.abspath('./json_files')  # json_filesを絶対パスに変更
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(JSON_DIR, exist_ok=True)

# POSTリクエストでBBotを実行
@bbot_bp.route('/run_bbot', methods=['POST'])
def run_bbot():
    command = ["bbot", "-p", "../scan_config.yml", "--force"]

    try:
        # タイムスタンプ付きファイル名（絶対パス）
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(OUTPUT_DIR, f"bbot_output_{timestamp}.txt")
        json_file = os.path.join(JSON_DIR, f"bbot_output_{timestamp}.json")  # JSONファイルの絶対パス

        # コマンド実行
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE, text=True)

        with open(output_file, 'w') as log_file:
            while True:
                stdout_line = process.stdout.readline()
                if stdout_line:
                    log_file.write(stdout_line)
                    print(stdout_line, end="")

                stderr_line = process.stderr.readline()
                if stderr_line:
                    log_file.write(stderr_line)
                    print(stderr_line, end="")

                if not stdout_line and not stderr_line and process.poll() is not None:
                    break

                if "Press enter" in stdout_line:
                    process.stdin.write("\n")
                    process.stdin.flush()

        stdout, stderr = process.communicate()

        if stderr:
            print("Standard Error:", stderr)

        # stdoutがJSON形式であれば、その内容をJSONファイルに保存
        try:
            structured_data = json.loads(stdout)  # stdoutがJSON形式であればパース
            with open(json_file, 'w') as json_out:
                json.dump(structured_data, json_out, indent=4)
        except json.JSONDecodeError:
            # JSON形式ではない場合はログファイルからデータを抽出
            print("標準出力はJSON形式ではありません。")
            structured_data = [{"message": line.strip()} for line in open(output_file).readlines() if line.strip()]

            # エラーメッセージをJSONファイルに保存
            with open(json_file, 'w') as json_out:
                json.dump(structured_data, json_out, indent=4)

        # クライアントに最新のJSONファイル名を返す
        return jsonify({'json_file': f"bbot_output_{timestamp}.json"})

    except Exception as e:
        return jsonify({"error": f"Error executing bbot: {str(e)}"}), 500

# 最新のJSONファイルを取得
@bbot_bp.route('/get_latest_json', methods=['GET'])
def get_latest_json():
    try:
        # JSONファイルの最新のものを取得
        files = [f for f in os.listdir(JSON_DIR) if f.endswith('.json')]
        if not files:
            return jsonify({"error": "No JSON files found"}), 404

        # 最新のファイルを取得
        latest_json_file = max(files, key=lambda f: os.path.getctime(os.path.join(JSON_DIR, f)))

        return jsonify({"latest_json_file": latest_json_file})

    except Exception as e:
        return jsonify({"error": f"Error retrieving latest JSON file: {str(e)}"}), 500

# JSONファイルを提供するエンドポイント
@bbot_bp.route('/json_files/<filename>')
def download_file(filename):
    try:
        # JSONファイルを返す
        return send_from_directory(JSON_DIR, filename)
    except Exception as e:
        return jsonify({"error": f"Error sending file: {str(e)}"}), 500
