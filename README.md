# Instance Scheduler for EC2 (AutoEC2)

## 概要

指定時刻に EC2 インスタンスの起動と停止を予約するための GUI アプリケーション。起動と停止は Amazon EventBridge にルールを登録することで行う。

## ビルド

```sh
# 依存モジュールのインストール
yarn

# ビルドディレクトリのクリーンアップ
yarn clean

# ビルド
yarn build

# パッケージ作成
yarn dist --linux
yarn dist --mac
yarn dist --win
```

## ライセンス

GPLv3 以降。  
頒布には一定の条件が課される。詳しくは GPLv3 の条文を確認のこと。
