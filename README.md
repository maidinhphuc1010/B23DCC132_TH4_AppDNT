# StudyManager — Thực hành 4: API và Offline Mode

Ứng dụng React Native/Expo quản lý môn học, lịch, bài tập, hồ sơ và kết quả học tập qua REST API json-server; hỗ trợ cache và thao tác offline.

## Công nghệ
React Native 0.81, Expo SDK 54, JavaScript/JSX, React Navigation, NetInfo, AsyncStorage, Fetch API, json-server, Jest, React Test Renderer, ESLint.

## Cấu trúc thư mục
```text
StudyManager/ App.js db.json README.md
src/{api,components,context,data,hooks,navigation,screens,storage,theme,types,utils}/
```
`api/`: request và endpoint services; `components/`: common/assignment/course/grade/profile/schedule; `context/`: AppDataContext, OfflineAppDataProvider, SyncContext; `hooks/`: network/cache/outbox/mutation; `screens/`: home/courses/schedule/assignments/profile; `storage/`: AsyncStorage cache/outbox. Entry App.js dùng navigation/provider trong src; mã HomeScreen.js và TypeScript cũ được giữ tương thích bài trước.

## Cài đặt, chạy Expo và json-server
Yêu cầu Node phù hợp Expo SDK 54 (>=20.19.4, khuyến nghị Node 22 LTS), npm, Android Emulator hoặc Expo Go tương thích SDK.
```powershell
npm install
# terminal 1
npm run api
# terminal 2
npm start
```
Quét QR hoặc nhấn `a` mở emulator. Android Emulator mặc định dùng `http://10.0.2.2:3000`. Điện thoại thật và máy tính phải cùng Wi-Fi; lấy IPv4 bằng `ipconfig`, cho phép Node/port 3000 qua firewall. Trước Expo đặt IP LAN thật:
```powershell
$env:EXPO_PUBLIC_API_URL = 'http://192.168.1.10:3000'
npm start -- --clear
```
Không dùng localhost trên điện thoại. Server dừng sẽ hiện lỗi/nút Thử lại, không dùng dữ liệu giả.

## Sử dụng
Năm tab: Tổng quan, Môn học, Lịch học, Bài tập, Cá nhân. Tìm/lọc môn, chọn ngày, thêm bài tập/đổi trạng thái/xem chi tiết, sửa hồ sơ, xem GPA và điểm. Kéo danh sách để refresh. GPA trọng số tín chỉ; F bằng 0 điểm trong mẫu số, không cộng tín chỉ tích lũy.

## Kiến trúc, cache và offline
```text
Màn hình → Hook → Service → request → API
                 ↘ Context điều phối ↔ Cache / Outbox (AsyncStorage)
GET: useCachedQuery đọc cache → render ngay → Service/API revalidate
Ghi offline: Screen → Context → Outbox + cache/override → auto sync → API
```
AppDataContext forward tới OfflineAppDataProvider. Hook/context điều phối cache/outbox; service chỉ gọi request, không tự đọc AsyncStorage. useCachedQuery cache-first, cập nhật savedAt. NetInfo điều khiển banner **Bạn đang offline**. Cache còn dùng được kèm thời gian cập nhật cuối; cache trống thì lỗi có Thử lại, không crash. Thao tác bài tập và hồ sơ offline được lưu bền vững trong outbox, UI cập nhật ngay, bài tập hiện **Chưa đồng bộ**. Reconnect xử lý FIFO, cập nhật API/cache, xóa action thành công và báo số thay đổi; lỗi mạng giữ action để thử lại.

## Xung đột B5
PATCH offline lưu `baseUpdatedAt`. Khi sync, GET phiên bản server trước PATCH; nếu `server.updatedAt` mới hơn base, không gửi PATCH, bỏ action xung đột khỏi outbox, cache bản server và báo người dùng. Nếu server không mới hơn thì gửi PATCH. Server thắng; muốn giữ nội dung local sau conflict cần sửa/lưu lại. updatedAt cần là ISO timestamp hợp lệ.

## Đối chiếu thang điểm
- **A — API (4):** BASE_URL/TIMEOUT, service/request, GET/POST/PATCH, loading/error/retry, validation, optimistic status, refresh, chi tiết và quan hệ.
- **B — Offline (4):** B1 NetInfo/banner; B2 cache-first/savedAt; B3 outbox/UI lạc quan; B4 reconnect sync; B5 server-wins updatedAt/thông báo.
- **C — Kết quả học tập (1):** học kỳ, chi tiết điểm, GPA quy đổi/trọng số tín chỉ.
- **D — Mã nguồn (1):** cấu trúc mục 5, phân tầng, component trình bày, theme, accessibility, EmptyState.

## Kiểm tra tự động
```powershell
npm test -- --runInBand
npm run lint
npx expo export --platform android
git diff --check
```
Mock tests không thay kiểm thử thiết bị/REST thật.

## GitHub và video bài nộp
Push repository GitHub, nộp link public hoặc cấp quyền giảng viên; đảm bảo có `db.json`, `README.md`, source và không có secret. Quay MP4 3–5 phút; không ghi PASS kịch bản chưa chạy thật.

### Video demo đề xuất (4:30)
| Thời gian | Cảnh quay |
|---|---|
| 0:00–0:20 | Giới thiệu, tab, Expo và json-server. |
| 0:20–0:45 | **1:** dừng server, app chưa cache; lỗi, Thử lại, không crash. |
| 0:45–1:10 | **2:** tải cache, airplane mode/restart; banner và thời gian. |
| 1:10–1:50 | **3:** offline hoàn thành 2 bài, thêm bài; nhãn chưa đồng bộ. |
| 1:50–2:20 | **4:** reconnect; thông báo, badge mất, db.json đổi. |
| 2:20–3:05 | **5:** offline sửa tên; db.json sửa tên và updatedAt mới hơn; reconnect, server thắng. |
| 3:05–3:30 | **6:** tìm môn không tồn tại/lọc rỗng; EmptyState. |
| 3:30–4:00 | **7:** pull-to-refresh và indicator. |
| 4:00–4:30 | GPA/chi tiết điểm, GitHub/README, kết luận. |

Giữ terminal/db.json đọc được, thao tác airplane mode trực tiếp; tải link Drive/YouTube không công khai vào bài nộp. Chuẩn bị dữ liệu trước nhưng thể hiện đủ từng thao tác.

Link render:https://b23dcc132-th4-appdnt.onrender.com