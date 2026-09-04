# Nhật ký Chăm sóc Sunshine / Sunshine Care Log

> Một công cụ theo dõi chăm sóc hàng ngày miễn phí và mở là cho bệnh nhân cao tuổi — được thiết kế cho những người chăm sóc gia đình.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Cái này là gì?

Một ứng dụng web song ngữ (Tiếng Trung Phồn thể 🇹🇼 / Tiếng Indonesia 🇮🇩) được thiết kế để giúp **những người chăm sóc gia đình** theo dõi dữ liệu sức khỏe hàng ngày của bệnh nhân cao tuổi tại nhà — đặc biệt là những người mắc các bệnh mãn tính cần quản lý chất lỏng nghiêm ngặt (suy tim, lọc thận, hồi phục sau phẫu thuật).

Không cần cài đặt. Hoạt động trên bất kỳ trình duyệt điện thoại thông minh nào. Dữ liệu được đồng bộ hóa với Google Sheets thông qua Google Apps Script.

---

## Tính năng

- **Theo dõi lượng chất lỏng tiêu thụ** — nước, đồ uống thuốc, thực phẩm bổ sung dinh dưỡng, thực phẩm (với mục tiêu hàng ngày và thanh tiến trình)
- **Theo dõi sản lượng chất lỏng** — lượng nước tiểu + màu sắc, chuyển động ruột với trạng thái
- **Thuật toán mục tiêu nước tiểu thông minh** — tự động tính toán sản lượng nước tiểu dự kiến dựa trên mục tiêu tiêu thụ nước, được điều chỉnh cho thuốc lợi tiểu (phạm vi ×1,1–1,5) so với không có thuốc (phạm vi ×0,4–0,6)
- **Cảnh báo quá tải chất lỏng** — cảnh báo đỏ khi tổng lượng tiêu thụ vượt quá 1.200 cm3
- **Ghi lại bài tập** — nâng chai, nhấn chân, uốn gối, hỗ trợ đứng dậy (với danh sách kiểm tra giao thức an toàn)
- **Huyết áp và nhịp tim** — các phép đo buổi sáng và buổi tối có hướng dẫn đo lường
- **Hệ thống cảnh báo táo bón** — tự động kích hoạt cảnh báo mỗi 2 giờ từ 60–72 giờ sau lần đi cầu cuối cùng, với hướng dẫn an toàn song ngữ cấm sử dụng thuốc nhuận tràng mà không có người giám sát
- **Theo dõi trạng thái thuốc** — thuốc lợi tiểu và thuốc nhuận tràng, lưu trữ trong đám mây
- **Hệ thống nhắc nhở dựa trên thời gian** — những lời nhắc nhở thông minh để đo huyết áp, các khoảng thời gian tập thể dục và kiểm tra nước tiểu trước khi đi ngủ
- **Đồng bộ hóa đám mây** — tất cả dữ liệu được lưu trong Google Sheets thông qua Google Apps Script; hỗ trợ các hộ gia đình có nhiều người chăm sóc
- **Giao diện lạc quan** — các bản ghi xuất hiện tức thì mà không cần chờ phản hồi của máy chủ
- **Lời nhắc nhở dọn dẹp hàng tuần** — lịch trình tích hợp cho các công việc vệ sinh gia đình

---

## Cái này dành cho ai?

- Các thành viên gia đình chăm sóc cha mẹ hoặc ông bà cao tuổi tại nhà
- Các hộ gia đình có nhiều người chăm sóc thay phiên (đặc biệt qua những rào cản ngôn ngữ)
- Bệnh nhân có tình trạng yêu cầu theo dõi chất lỏng nghiêm ngặt (suy tim, lọc thận, hồi phục sau phẫu thuật)

---

## Ngăn xếp công nghệ

| Lớp | Công nghệ |
|-------|-----------|
| Frontend | HTML Vanilla + JavaScript + Tailwind CSS |
| Backend | Google Apps Script (không máy chủ) |
| Cơ sở dữ liệu | Google Sheets |
| Lưu trữ | GitHub Pages (miễn phí) |

Không có framework. Không có công cụ xây dựng. Không có phụ thuộc cần cài đặt. Mở trực tiếp trong bất kỳ trình duyệt nào.

---

## Cài đặt / Tự lưu trữ

1. Fork kho lưu trữ này
2. Triển khai backend Google Apps Script của riêng bạn (xem `GAS_URL` trong `index.html`)
3. Tạo Google Sheet để lưu trữ dữ liệu
4. Cập nhật các hằng số `GAS_URL` và `SPREADSHEET_URL` trong `index.html`
5. Bật GitHub Pages trên fork của bạn → xong

---

## Ảnh chụp màn hình

| Theo dõi hàng ngày | Nhập liệu được hướng dẫn song ngữ | Phân tích xu hướng |
|---|---|---|
| Nhật ký chăm sóc hàng ngày: thanh tiến trình, mục tiêu tiêu thụ chất lỏng với thanh tiến trình, lựa chọn các danh mục nước/thuốc/dinh dưỡng/thực phẩm | Màn hình nhập liệu được hướng dẫn hiển thị hướng dẫn bằng tiếng Trung Phồn thể và tiếng Indonesia cạnh nhau, có các bước được đánh số | Trang phân tích xu hướng sức khỏe với bộ chọn phạm vi 7/14/30 ngày và mười lăm biểu đồ biến chéo có thể chọn |
| Thanh tiến trình, mục tiêu chất lỏng và ghi lại các danh mục | Mỗi chuỗi bằng tiếng Trung Phồn thể và tiếng Indonesia, từng bước | 15 biểu đồ biến chéo (7/14/30 ngày) |

*（Demo trực tiếp: https://anwer3712.github.io/diet-log/ — ảnh chụp màn hình được chụp trên cổng xem điện thoại 414×896）*

---

## Động lực

Được xây dựng từ nhu cầu. Khi một thành viên gia đình cần chăm sóc tại nhà 24/7 với quản lý chất lỏng nghiêm ngặt, các ứng dụng hiện có quá phức tạp, chỉ tiếng Anh hoặc yêu cầu đăng ký hàng tháng. Công cụ này nhằm cung cấp một giải pháp đơn giản, miễn phí và đa ngôn ngữ để những người chăm sóc có thể tập trung vào bệnh nhân, không phải ứng dụng.

---

## Lộ trình

Những cải tiến được kế hoạch — mỗi cái là một vấn đề mở, phản hồi của cộng đồng được chào đón:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Phân tích sức khỏe hỗ trợ AI** — tích hợp Claude để phát hiện các xu hướng bất thường trong dữ liệu lượng chất lỏng tiêu thụ, sản lượng nước tiểu và huyết áp, và dịch các con số thô thành hướng dẫn chăm sóc bằng ngôn ngữ bình thường
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Câu hỏi và trả lời của người chăm sóc AI** — cho phép những người chăm sóc đặt câu hỏi bằng ngôn ngữ của họ (ví dụ: "nước tiểu của cô ấy có màu sẫm hôm nay, tôi có nên lo lắng không?") dựa trên dữ liệu thực tế được ghi của bệnh nhân
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Các cặp ngôn ngữ bổ sung** — tiếng Anh, tiếng Việt, tiếng Tagalog, tiếng Thái cho các gia đình chăm sóc đa văn hóa
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Chế độ ngoại tuyến** — bộ nhớ cache công nhân dịch vụ cho các kết nối không ổn định
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Báo cáo hàng tuần có thể in được** — tóm tắt một trang cho các lần khám bác sĩ
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Hỗ trợ đa bệnh nhân** — cho các hộ gia đình hoặc cơ sở chăm sóc nhỏ theo dõi nhiều hơn một người

---

## Góp phần

Yêu cầu kéo được chào đón — xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách giúp (các đóng góp dịch thuật được đặc biệt đánh giá cao). Dự án này tuân theo [Quy tắc ứng xử](CODE_OF_CONDUCT.md).

Nếu bạn chăm sóc một thành viên gia đình cao tuổi và cần một tính năng — [mở một vấn đề](https://github.com/anwer3712/diet-log/issues).

---

## Bảo mật

Tìm thấy lỗ hổng? Vui lòng báo cáo nó riêng tư — xem [SECURITY.md](SECURITY.md).
Không mở vấn đề công khai và không bao giờ bao gồm dữ liệu bệnh nhân thực tế trong báo cáo.

---

## Giấy phép

MIT © 2026 anwer3712
