# NasakenaStar

星空の無限キャンバスに、星座を作って神話を刻む掲示板。

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## Firebase 設定 (リアルタイム同期)

1. [Firebase コンソール](https://console.firebase.google.com) でプロジェクトを作成
2. Firestore Database を有効化 (テストモード)
3. Authentication → 匿名ログインを有効化
4. `.env.example` を `.env` にコピーして設定値を入力

```bash
cp .env.example .env
# .env を編集して Firebase 設定を入力
```

Firebase未設定の場合は自動的にローカル保存モード（localStorage）で動作します。

## 使い方

- **ドラッグ**: キャンバスをパン
- **ホイール**: ズームイン/アウト
- **✦ 星座を作る**: クリックして星を繋ぎ、名前と神話を入力
- **星座一覧**: 右上のボタンから既存の星座を閲覧
