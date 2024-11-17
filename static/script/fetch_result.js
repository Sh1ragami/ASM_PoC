document.addEventListener('DOMContentLoaded', function () {
    // 初期化処理: ページ読み込み時に最新のJSONを表示
    loadJsonData('/get_latest_json');

    // スキャンボタンのクリックイベントを追加
    const scanButton = document.getElementById('run-scan-btn');
    if (scanButton) {
        scanButton.addEventListener('click', runBbotScan);
    }
});

function runBbotScan(event) {
    event.preventDefault(); // デフォルトのボタン動作を防ぐ
    toggleLoadingIndicator(true);

    // スキャンを実行
    fetch('/run_bbot', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('スキャンの実行に失敗しました');
            }
            return response.json();
        })
        .then(data => {
            // スキャン後に新しいJSONファイルを表示するためにロード
            loadJsonData('/get_latest_json' );
        })
        .catch(error => {
            handleError(error);
        })
        .finally(() => {
            toggleLoadingIndicator(false);
        });
}


// JSONファイルを取得してテーブルに表示する共通関数
function loadJsonData(jsonFileEndpoint) {
    toggleLoadingIndicator(true);

    fetch(jsonFileEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('JSONファイルの取得に失敗しました');
            }
            return response.json();
        })
        .then(data => {
            const jsonFileName = data.latest_json_file;
            if (!jsonFileName) {
                throw new Error('jsonFileNameが存在しません');
            }
            return fetchJsonFile(`/json_files/${jsonFileName}`);
        })
        .then(jsonData => {
            if (!Array.isArray(jsonData)) {
                throw new Error('期待された形式ではないデータが返されました');
            }
            displayJsonDataByCategory(jsonData);
        })
        .catch(error => {
            handleError(error);
        })
        .finally(() => {
            toggleLoadingIndicator(false);
        });
}

// JSONファイルの内容をカテゴリ別に表示する
function displayJsonDataByCategory(jsonData) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // 以前の出力をクリア

    // カテゴリ別にデータを分類
    const categories = {};

    jsonData.forEach(item => {
        const message = item.message;
        const categoryMatch = message.match(/^\[(.*?)\]/);
        if (categoryMatch) {
            const category = categoryMatch[1];
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(message);
        }
    });

    // 各カテゴリごとにテーブルを作成
    for (const category in categories) {
        const table = document.createElement('table');
        table.classList.add('category-table'); // スタイル調整用のクラスを追加
        table.style.marginBottom = '20px'; // テーブル間の余白

        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // ヘッダー行を追加
        const thCategory = document.createElement('th');
        thCategory.colSpan = 2;
        thCategory.textContent = category;
        headerRow.appendChild(thCategory);
        tableHeader.appendChild(headerRow);
        table.appendChild(tableHeader);

        const tableBody = document.createElement('tbody');

        // メッセージごとに行を追加
        categories[category].forEach(message => {
            const row = document.createElement('tr');
            const tdMessage = document.createElement('td');
            tdMessage.textContent = message;
            row.appendChild(tdMessage);
            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        outputDiv.appendChild(table);
    }
}

// JSONファイルを取得する関数
function fetchJsonFile(jsonFilePath) {
    return fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`JSONファイルの取得に失敗しました: ${jsonFilePath}`);
            }
            return response.json();
        });
}

// エラーハンドリング
function handleError(error) {
    console.error('エラー:', error);
    const outputDiv = document.getElementById('output');
    outputDiv.textContent = `エラー: ${error.message}`;
    outputDiv.style.color = 'red'; // エラーメッセージを赤く表示
}

// ローディングインジケーターの表示・非表示
function toggleLoadingIndicator(isLoading) {
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
}
