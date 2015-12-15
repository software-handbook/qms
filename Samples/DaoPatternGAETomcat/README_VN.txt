Thư mục này gồm 3 project để minh họa 1 dự án được phát triển trên nền Google App Engine (GAE) có thể được triển khai trên máy cục bộ với Tomcat và CSDL riêng.

Nhận định:
=======================
- Điểm khác biệt cơ bản giữa ứng dụng web được phát triển trên nền GAE và Tomcat là tầng dữ liệu (GAE gọi là tầng Persistent, trong ứng dụng Web nói chung gọi là tầng DAO).

Phân tích
=======================
- Từ nhận định trên, chúng ta có thể thiết kế tầng DAO linh hoạt bằng cách chỉ định tầng DAO trong một file cấu hình.
  Xem mã nguồn của lớp "DaoManager" (/WebAccountGAETomcat/src/openones/tms/account/dao/DaoManager.java)
- Các thao tác với CSDL được định nghĩa trong interface. Ví dụ để thao tác đối tượng tài khoản (Account), chúng ta tạo ra Interface như "/WebAccountGAETomcat/src/openones/tms/account/dao/DaoManager.java"
- Tùy theo ứng dụng chúng ta chạy trên máy chủ nào (GAE hay Tomcat) thì sẽ cài đặt các phương thức cho Account Interface riêng.

Triển khai
=======================
Để minh họa cho nhận định và phân tích ở trên. Phần này sẽ minh họa 1 ví dụ: Viết 1 ứng dụng web cho phép:
+ Thêm mới thông tin 1 tài khoản (Account) vào CSDL.
+ Liệt kê tất cả tài khoản có trong CSDL.

Có 3 project như sau:
1) WebAccountGAETomcat: là dự án được phát triển trên nền GAE. Thư mục mã nguồn;
/WebAccountGAETomcat/src
└── openones
    └── tms
        └── account
            ├── dao
            │   ├── DaoManager.java           : Quản lý DAO tổng quát.
            │   └── IAccountDao.java          : Interface định nghĩa các phương thức CRUD cho đối tượng (Entity) Account
            │                                   (Cài đặt được đóng gói trong thư viện /WebAccountGAETomcat/war/WEB-INF/lib/webaccount-gaedao-0.0.1.jar)
            ├── entity
            │   └── Account.java              : Entity Account
            └── WebAccountGAEServlet.java     : Servlet đóng vai trò Controller để minh họa 2 chức năng của chương trình tương tác trên Web.
Để đóng gói Entity (Account.java), Interface (IAccountDao.java) và DaoManager.jar thì dùng tool ANT (http://ant.apache.org) với lệnh:
ant dist-daomanager

Để đóng gói dự án thành gói .war thì dùng lệnh:
ant dist

2) WebAccount-GAEDao: là dự án được phát triển trên nền GAE để cài đặt Interface IAccountDao.java ở trên
Đóng gói dự án này bằng tool ANT: ant dist

Sản phẩm (gói webaccount-gaedao-0.0.1.jar) của dự án này sẽ được dùng cho dự án WebAccountGAETomcat khi chạy trên GAE.
3) WebAccount-HibernateDao: là dự án được phát triển trên Tomcat để cài đặt Interface IAccountDao.java ở trên.
Để đóng gói tầng DAO cho dự án WebAccountGAETomcat chạy với Tomcat thì thì dùng tool ANT với lệnh:
ant dist-hibernatedao

Sản phẩm (gói webaccount-hibernatedao-0.0.1.jar) của dự án này sẽ được dùng cho dự án WebAccountGAETomcat khi chạy trên Tomcat.

Thử nghiệm
=======================
- Để chạy WebAccountGAETomcat với GAE thì cần chuẩn bị Eclipse có cài plugin GAE và GAE SDK. Sau đó import dự án vào và chạy từ mã nguồn.
  Ghi chú:
    + File /WebAccountGAETomcat/src/app.properties đã cấu hình sẵn sàng để dùng tầng DAO (openones.tms.account.gaedao.GAEAccountDao). Tầng DAO này cũng được chuẩn bị sẵn trong gói /WebAccountGAETomcat/war/WEB-INF/lib/webaccount-gaedao-0.0.1.jar.
- Để chạy WebAccountGAETomcat với Tomcat thì phải đóng gói thành file .war rồi deploy file .war này vào Tomcat bằng cách:
    + Dùng Eclipse có cài ANT tool (hoặc chạy ANT từ dòng lệnh), thực hiện "ant dist" từ file build.xml.
      (Hoặc lấy file .war đã build sẵn trong thư mục release/webaccount-x.y.z/)
  Lấy kết quả (File webaccount.war trong WebAccountGAETomcat/dist/webaccount-0.0.1/) triển khai vào Tomcat.
  Trong file webaccount.war này đã chuẩn bị sẵn file cấu hình chỉ định tầng DAO cho Tomcat (WEB-INF/classes/app.properties) và cấu hình CSDL (WEB-INF/classes/hibernate.cfg.xml).
  
  Trong đó, CSDL được dùng mặc định là HSQL 1.8 (có sẵn thư mục ngang cấp với 3 thư mục của dự án). Khởi động CSDL HSQL bằng cách thực thi file hsqldb-1.8/demodb/StartDB.bat

_____________________
Open-Ones
ThachLN@gmail.com