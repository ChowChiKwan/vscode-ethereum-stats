const vscode = require('vscode');
const fetch = require('node-fetch');

const settings = {
    bar: {},
    config: {},
    url: 'https://api.binance.com/api/v3/ticker/price?symbols=',
    // url: 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=',
    icons: {
        low: '🌤',
        normal: '🌧',
        high: '🌩',
        BTCBUSD: '😋',
        ETHBUSD: '😍',
        HTUSDT: '🤣',
        loading: '🚀',
        error: '🚧'
    },
    messages: {
        loading: 'Updating prices...',
        error: 'Connection error',
        missed: '(Missed API key)'
    }
};

exports.activate = context => {
    let timer;
    settings.config = vscode.workspace.getConfiguration('ethereum-price');
    settings.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    vscode.commands.registerCommand('ethereum-price.update', update);
    settings.bar.command = 'ethereum-price.update';
    context.subscriptions.push(settings.bar);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        settings.config = vscode.workspace.getConfiguration('ethereum-price');
        clearInterval(timer);
        update();
        timer = setInterval(update, 1000 * settings.config.refreshInterval);
    }));
    settings.bar.show();
    update();
    timer = setInterval(update, 1000 * settings.config.refreshInterval);
};

exports.deactivate = () => {};

const update = async () => {
    // renderBar(settings.messages.loading, settings.icons.loading);
    try {
        const response = await fetch(`${settings.config.url || settings.url}${settings.config.symbols}`);
        const data = await response.json();
        renderResult(data);
    } catch(e) {
        renderBar(settings.messages.error, settings.icons.error);
    }
};

const renderBar = (message, icon) => {
    settings.bar.text = `${settings.config.showIcons ? icon + ' ' : ''}${message}`;
};

const renderResult = data => {
    const text = data.map(({ symbol, price }) => `${symbol}: ${Number(price).toFixed(3)}`).join(', ');
    renderBar(text, settings.icons.loading);
};
