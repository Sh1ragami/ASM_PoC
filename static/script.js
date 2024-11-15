document.getElementById('bbot-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const target = document.getElementById('target').value;
    const isPassive = document.getElementById('passive').checked;

    // ローディングインジケーターを表示
    document.getElementById('loading').style.display = 'block';
    document.getElementById('no-results').style.display = 'none';  // 結果なしのメッセージを非表示
    document.getElementById('results-table').style.display = 'none';  // 結果テーブルを非表示

    fetch('/run_bbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `target=${encodeURIComponent(target)}&passive=${isPassive}`
    })
        .then(response => response.json())  // JSONとして受け取る
        .then(data => {
            const output = document.getElementById('output');
            const loading = document.getElementById('loading');

            // ローディングインジケーターを非表示
            loading.style.display = 'none';

            // 出力ファイルのパスを取得
            const outputFilePath = data.output_file;
            if (!outputFilePath) {
                output.textContent = '出力ファイルが見つかりませんでした';
                document.getElementById('no-results').style.display = 'block';
                return;
            }

            // テキストファイルをフェッチして表示
            fetch(outputFilePath)
                .then(response => response.text())  // テキストとして受け取る
                .then(fileContent => {
                    output.textContent = fileContent;  // ファイルの内容を表示

                    // ローカルストレージに結果を保存
                    localStorage.setItem('previousResults', fileContent);
                })
                .catch(error => {
                    output.textContent = `ファイルの読み込みエラー: ${error}`;
                    document.getElementById('loading').style.display = 'none'; // エラー発生時もローディング非表示
                    document.getElementById('no-results').style.display = 'block'; // 結果なしのメッセージを表示
                });
        })
        .catch(error => {
            const output = document.getElementById('output');
            output.textContent = `ネットワークエラー: ${error}`;
            document.getElementById('loading').style.display = 'none'; // エラー発生時もローディング非表示
            document.getElementById('no-results').style.display = 'none'; // 結果なしのメッセージも非表示
        });
});
