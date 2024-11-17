document.addEventListener('DOMContentLoaded', function () {
    // CodeMirrorエディタの初期化
    var editor = CodeMirror.fromTextArea(document.getElementById("yaml-editor"), {
        lineNumbers: true,
        mode: "yaml",
        theme: "blackboard", // 任意のテーマ
        lineWrapping: true,
        tabSize: 2,
    });

    // 初期の高さを設定
    editor.setSize('100%', '80vh');

    // 高さを超える場合にスクロールを有効に
    document.getElementById("yaml-editor").style.overflowY = 'auto';

    // ページロード時にYAMLファイルを取得して表示
    fetch('/get_yaml')
        .then(response => response.json())
        .then(data => {
            editor.setValue(data.yaml);  // YAML内容をエディタに表示
        })
        .catch(error => {
            document.getElementById('message').innerText = 'YAMLファイルの読み込みエラー: ' + error;
        });

    // YAMLを送信して保存
    document.getElementById('yaml-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const yamlContent = editor.getValue();  // エディタからYAMLの内容を取得
        fetch('/save_yaml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ yaml: yamlContent })
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('message').innerText = data.message;
            })
            .catch(error => {
                document.getElementById('message').innerText = '保存エラー: ' + error;
            });
    });
});
