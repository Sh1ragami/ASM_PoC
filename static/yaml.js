// ページロード時にYAMLファイルを取得して表示
fetch('/get_yaml')
    .then(response => response.json())
    .then(data => {
        document.getElementById('yaml-editor').value = data.yaml;
    })
    .catch(error => {
        document.getElementById('message').innerText = 'YAMLファイルの読み込みエラー: ' + error;
    });

// YAMLを送信して保存
document.getElementById('yaml-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const yamlContent = document.getElementById('yaml-editor').value;
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