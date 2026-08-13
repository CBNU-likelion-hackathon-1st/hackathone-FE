# 요구사항

만들어야 하는 것은 인공지능과 대화하는 웹이다.
그 웹에서 인공지능과 대화할 수 있으며 그 인공지능과 말싸움으로 이겨야 하는 웹 게임이다.
시작하자마자 보이는 페이지는 src/assets에 있는 first.png이다.
이후 게임을 시작하는 버튼을 누르면 second.png에 있는 페이지러 이동하여 게임을 수행한다.
게임 승리 여부를 충분히 판단했으면 third.png처럼 이동하여 결과를 확인하도록 한다.

# 개발시 주의사항

각 화면(main, game, result)은 그 각각의 브랜치(feature/main, feature/game, feature/result)에서 작업한다.
나중에 병합할 때 충돌이 나지 않아야 하므로, src 내 폴더(src/main, src/game, src/result)를 생성하여 작업한다.
