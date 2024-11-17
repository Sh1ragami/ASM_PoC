// フォーム送信時にAPIリクエストを送信
document.getElementById('bbot-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const target = document.getElementById('target').value;
    const passive = document.getElementById('passive').checked ? 'true' : 'false';

    // ローディング表示
    document.getElementById('loading').style.display = 'block';

    fetch('/run_bbot', {
        method: 'POST',
        body: new URLSearchParams({ target: target, passive: passive }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .then(response => response.json())
        .then(data => {
            // ローディングを非表示
            document.getElementById('loading').style.display = 'none';

            if (data.error) {
                document.getElementById('no-results').style.display = 'block';
                document.getElementById('result').style.display = 'none';
                document.getElementById('download-link').style.display = 'none';
            } else {
                document.getElementById('no-results').style.display = 'none';
                document.getElementById('result').style.display = 'block';
                document.getElementById('output').textContent = JSON.stringify(data.structured_data, null, 2);

                // ダウンロードリンクを設定
                const downloadLink = `/download/${data.output_file}`;
                const downloadBtn = document.getElementById('download-btn');
                downloadBtn.href = downloadLink;
                document.getElementById('download-link').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('no-results').style.display = 'block';
        });
});