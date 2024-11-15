import yaml
from flask import Blueprint, request, jsonify

# Blueprintオブジェクトを作成
yaml_bp = Blueprint('yaml_handler', __name__)
YAML_FILE_PATH = './scan_config.yml'

# YAMLファイルの内容を取得
@yaml_bp.route('/get_yaml', methods=['GET'])
def get_yaml():
    try:
        with open(YAML_FILE_PATH, 'r', encoding='utf-8') as file:
            yaml_content = file.read()
        return jsonify({"yaml": yaml_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# YAMLファイルを保存
@yaml_bp.route('/save_yaml', methods=['POST'])
def save_yaml():
    try:
        # フロントエンドからのYAMLデータを取得
        data = request.get_json()
        yaml_content = data.get("yaml", "")

        # YAML形式の検証
        try:
            yaml.safe_load(yaml_content)  # 無効なYAMLの場合エラーが発生
        except yaml.YAMLError as e:
            return jsonify({"error": f"YAML形式が無効です: {str(e)}"}), 400

        # YAMLファイルに保存
        with open(YAML_FILE_PATH, 'w', encoding='utf-8') as file:
            file.write(yaml_content)

        return jsonify({"message": "YAMLファイルが正常に保存されました"})
    except Exception as e:
        return jsonify({"error": f"予期しないエラーが発生しました: {str(e)}"}), 500
