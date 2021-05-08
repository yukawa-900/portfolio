# 会計アプリの説明

### ① 時間当たり採算アプリ

![result](https://github.com/yukawa-900/portfolio/blob/media/ameba.gif)

時間当たり付加価値とは、収入から人件費を除く支出を引き、労働時間で割った値です。京セラの稲盛和夫氏が開発した、管理会計手法**アメーバ経営**において利用されます。このアプリでは採算表だけでなく、グラフ化・ランキングの作成など、
管理会計の知識が乏しい方でも、直感的にアメーバの経営状況を把握できるようになることを目指して作成しました。

### ② 仕訳アプリ

![result](https://github.com/yukawa-900/portfolio/blob/media/bookkeeping.gif)

仕訳アプリでは、仕訳を入力・管理することができます。会計では、1 つの取引を「借方」と「貸方」に分けて記帳していきます。これを仕訳といいます。例えば 1,000 円の売上が発生し、その代金を現金で受け取った場合には、以下のような仕訳となります。

(借方) 現金 1000 円 (貸方) 売上 1000 円

# URL とログイン情報

- URL: [https://ameba.yu-kawa.com/signin](https://ameba.yu-kawa.com/signin)
- ログイン ID: sample@gmail.com
- パスワード: sample_password

# 使用技術

- React
  - TypeScript
  - React Hooks
  - **Redux Toolkit**
  - Material UI
- Django REST Framework
- **GraphQL**
  - 時間当たり採算アプリに利用
  - フロントエンド: Apollo Client
  - バックエンド: graphene-django
- Beautiful Soup
  - 勘定科目のスクレイピングに利用
- API
  - Twitter API （Twitter ログイン用）
  - SendGrid API (メール送信用)
  - 欧州中央銀行の為替 API（2021/04 から有料化)
- Nginx
- Let's Encrypt （SSL 証明)
- PostgreSQL
- Docker
- **Circle CI**
- AWS
  - EC2
  - RDS
  - S3
  - CloudFront
  - ECR

※ポートフォリオ外では、Flask を使ったアプリ開発や、[Gatsby を使ったブログ](https://yu-kawa.com)作成などの経験あり

#### AWS 図

![AWS](https://user-images.githubusercontent.com/67470479/116664805-eaf43a80-a9d3-11eb-9528-28bb19183a8c.png)

# 機能一覧

#### 【ログイン】

- JWT 認証（有効期限 5 分）
- Twitter 認証
- ログイン・新規登録・パスワードリセット

#### 【簿記アプリ】

- 仕訳入力
  - 為替レートを取得し、日本円に変換
  - PDF アップロード機能
- 仕訳編集
  - 会計的な理由にりょい、入力した当日のみ編集可能
- 仕訳検索
  - 日付、伝票番号、PDF 名から過去の仕訳を検索できる
- 設定項目
  - 有効/無効の切り替え（無効にすると、入力・編集画面で候補に表示されない）
  - 新規追加・編集可能: 部門、勘定科目

#### 【時間当たり採算アプリ】

- 入力
  - 収入・支出・労働時間を入力
- 編集
  - 過去の入力
- 入力データを集計
  - 合計
  - ランキング
  - 採算表
  - 棒グラフ・折れ線グラフ・円グラフ
- 設定項目の新規追加・編集
  - 画像アップロード / 画像の切り抜き

#### 【フロントエンド】

- ダークモード切り替え
- レスポンシブ対応

# 今後の課題

- テストの充実化
- CD
- SES(AWS のメールサービス)
- （時間当たり採算アプリ）仕訳入力を可能にする

# 大学 4 年次に（就職までに）勉強すること

#### 勉強すること

- デザインパターン
- AWS 資格（アソシエイトレベル）
- Web の知識
- その他、就職先で必要となる技術

#### 余裕があればやりたいこと

- Go Lang でアプリ開発
- 統計・データサイエンスの勉強
- Flutter でスマホアプリ開発入門
- Chrome 拡張機能を作る
