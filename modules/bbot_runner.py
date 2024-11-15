from flask import Blueprint, request, jsonify
import subprocess
import os
from datetime import datetime

# Blueprintオブジェクトを作成
bbot_bp = Blueprint('bbot_runner', __name__)
OUTPUT_DIR = './output_files'
os.makedirs(OUTPUT_DIR, exist_ok=True)

@bbot_bp.route('/run_bbot', methods=['POST'])
def run_bbot():
    target = request.form.get('target')
    passive = request.form.get('passive')

    if not target:
        return jsonify({"error": "ターゲットドメインが指定されていません。"}), 400

    if not isinstance(target, str) or len(target) == 0:
        return jsonify({"error": "無効なターゲットドメインです。"}), 400

    # bbot コマンドの準備
    command = ["bbot", "-t", target, "-p", "subdomain-enum"]
    if passive == 'true':
        command.extend(["-rf", "passive"])

    try:
        # 出力ファイルのパスを作成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(OUTPUT_DIR, f"bbot_output_{timestamp}.txt")

        # subprocess.Popenでコマンドを実行
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE, text=True)

        # 出力をファイルに書き込む
        with open(output_file, 'w') as file:
            while True:
                # 標準出力から1行ずつ読み取る
                line = process.stdout.readline()

                if not line and process.poll() is not None:
                    break  # プロセスが終了した場合にループを抜ける

                if line:
                    # 出力をファイルに書き込む
                    file.write(line)
                    print(line, end="")

                    # 'Press enter' が出力に含まれていた場合、Enter を送信
                    if "Press enter" in line:
                        process.stdin.write("\n")
                        process.stdin.flush()

        # 残りの標準出力と標準エラーを取得
        stdout, stderr = process.communicate()

        if stderr:
            print("Standard Error:", stderr)

        # 出力がJSON形式なら解析
        try:
            structured_data = json.loads(stdout)
        except json.JSONDecodeError:
            structured_data = [{"message": line} for line in open(output_file).readlines() if line.strip()]

        return jsonify({"output_file": output_file, "structured_data": structured_data})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"コマンドの実行中にエラーが発生しました: {e.stderr}"}), 500
    except Exception as e:
        return jsonify({"error": f"予期しないエラーが発生しました: {str(e)}"}), 500
