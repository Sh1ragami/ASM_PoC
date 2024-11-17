// ファイルリストを取得して表示
fetch('/list_output_files')
    .then(response => response.json())
    .then(data => {
        const fileList = data.files;
        const fileListElement = document.getElementById("file-list");

        // ファイル名を日付と時間でソート
        fileList.sort((a, b) => {
            // ファイル名から日付と時間を抽出 (例: "bbot_output_20241115_152332.txt" -> "20241115_152332")
            const dateTimeA = a.match(/_(\d{8}_\d{6})\.txt$/)[1]; // 例: "20241115_152332"
            const dateTimeB = b.match(/_(\d{8}_\d{6})\.txt$/)[1];

            // ソート: 新しい順に並べるために降順に比較
            return dateTimeB.localeCompare(dateTimeA);
        });

        // ソートしたファイルリストをドロップダウンメニューに追加
        fileList.forEach(file => {
            const option = document.createElement("option");
            option.value = file;
            option.textContent = file;
            fileListElement.appendChild(option); // select要素に追加
        });

        // 最新のファイルを表示する
        if (fileList.length > 0) {
            const latestFile = fileList[0]; // 最新のファイル
            viewFile(latestFile); // ファイルの内容を表示
            fileListElement.value = latestFile; // ドロップダウンの値を最新ファイルに設定
        }

        // ドロップダウンメニューの変更を監視
        fileListElement.addEventListener("change", (event) => {
            const selectedFile = event.target.value;
            if (selectedFile) {
                viewFile(selectedFile); // ファイルの内容を表示
            }
        });
    })
    .catch(error => {
        console.error("エラー:", error);
    });


// ファイルの内容を取得して表示
function viewFile(filename) {
    fetch(`/view_file/${filename}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // レスポンス内容を確認
            if (data.content) {
                const fileContentElement = document.getElementById("file-content");
                // ファイル内容を強調表示する関数を呼び出す
                fileContentElement.innerHTML = highlightText(data.content);
            } else {
                alert("ファイルの読み込みに失敗しました");
            }
        })
        .catch(error => {
            console.error("エラー:", error);
        });
}

// 特定のキーワードに色を付ける関数
function highlightText(text) {
    const highlights = [];

    // チェックボックスの状態を確認
    if (document.getElementById("highlight-dns").checked) {
        highlights.push({ regex: /DNS_NAME/g, className: 'highlight-dns' });
    }
    if (document.getElementById("highlight-mail").checked) {
        highlights.push({ regex: /EMAIL_ADDRESS/g, className: 'highlight-mail' });
    }
    if (document.getElementById("highlight-asn").checked) {
        highlights.push({ regex: /ASN/g, className: 'highlight-asn' });
    }
    if (document.getElementById("highlight-cve").checked) {
        highlights.push({ regex: /CVE/g, className: 'highlight-cve' });
    }

    // キーワードに対応するハイライトを適用
    highlights.forEach(highlight => {
        text = text.replace(highlight.regex, `<span class="${highlight.className}">$&</span>`);
    });

    return text;
}

// チェックボックスの変更を監視
document.querySelectorAll('.checkbox-list input').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const selectedFile = document.getElementById("file-list").value;
        if (selectedFile) {
            viewFile(selectedFile); // ファイルを再表示してハイライトを更新
        }
    });
});

// スライダーの値が変わったときに文字サイズを変更
document.getElementById("font-size-range").addEventListener("input", (event) => {
    const fontSize = event.target.value + "px";
    const fileContentElement = document.getElementById("file-content");

    // 文字サイズを変更
    fileContentElement.style.fontSize = fontSize;

    // 現在のサイズを表示
    document.getElementById("font-size-value").textContent = fontSize;
});