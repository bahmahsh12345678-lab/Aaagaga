# Kamera İzleme — APK oluşturma (kolay yol)

Bu kaynak paketi henüz derlenmiş APK değildir. Bu çalışma ortamında Android SDK ve Gradle bulunmadığı, bağımlılık indirme işlemi de tamamlanamadığı için burada gerçek APK derlemesi yapamadım. Pakete, APK'yı GitHub üzerinde otomatik derleyecek bir iş akışı ekledim.

## APK dosyasını otomatik almak

1. GitHub'da yeni, özel (private) bir depo oluşturun.
2. Bu ZIP'i bilgisayarınızda açın ve içindeki dosyaları depoya yükleyin. `.github/workflows/build-apk.yml` dosyasının da yüklendiğinden emin olun.
3. GitHub deposunda **Actions** sekmesini açın.
4. **Kamera Izleme APK derle** iş akışını seçin ve **Run workflow** düğmesine basın.
5. İşlem başarılı olunca çalışmanın altındaki **Artifacts** bölümünden `kamera-izleme-debug-apk` dosyasını indirin. ZIP'in içindeki `app-debug.apk` Android telefona kurulabilir test APK'sıdır.

## Önemli: APK derlenmesi, canlı bağlantının hazır olduğu anlamına gelmez

İnternet üzerinden telefonları bağlamak için `public/index.html` içindeki `SIGNAL_URL` değerinin gerçek `wss://...` sunucu adresiyle değiştirilmesi ve sinyalleşme sunucusunun TLS ile internette çalışır durumda olması gerekir. Bazı ağlarda TURN sunucusu da gerekir. Gerçek sunucu adresi yapılandırılmadan uygulama canlı bağlantı kuramaz.

Kamera ve mikrofon, yalnızca linki açan kişi uygulama içindeki onayı verip Android izin penceresini kabul ettikten sonra kullanılmalıdır. Bu kaynak paketi gerçek cihazlarda uçtan uca test edilmiş değildir; dağıtımdan önce test edilmelidir.
