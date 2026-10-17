# Kamera İzleme — APK kaynak projesi

Bu proje, **linki oluşturan cihazın izleyici**, linki açan kişinin ise **kamera/mikrofon paylaşımını başlatan taraf** olduğu akışa göre düzenlenmiştir. Kamera ve mikrofon yalnızca kişi sayfada onay verdikten ve işletim sistemi izin penceresini kabul ettikten sonra açılır. Aktarım WebRTC ile canlıdır; kayıt düğmesi yoktur.

> Bu paket derlenmiş APK değildir. İnternet üzerinden çalışması için önce sinyalleşme sunucusu ve HTTPS web alan adı kurmanız, sonra Android Studio ile derlemeniz gerekir. Buradan sizin adınıza bir sunucu/alan adı satın alamam veya internete dağıtamam; bu yüzden çalışan bir genel linki ya da hazır APK'yı test etmiş gibi sunmuyorum.

## İçindekiler
- `public/index.html` — mobil uyumlu arayüz ve WebRTC istemcisi
- `server/server.js` — WebSocket sinyalleşme sunucusu; her davette tek owner ve tek sharer
- `server/Dockerfile` — sunucuyu Docker ortamında çalıştırmak için
- `capacitor.config.json`, `package.json`, `scripts/` — Android/Capacitor hazırlığı

## 1. Sinyalleşme sunucusu
Node.js 20+ gerekir.

```bash
cd server
npm install
npm start
```

Varsayılan port `8080`. Sağlık kontrolü için `http://SUNUCU:8080/` JSON yanıtı verir. Gerçek kullanımda sunucuyu TLS sağlayan bir reverse proxy/hosting arkasına koyun ve dışarıya `wss://...` sunun. `ws://` üzerinden internet kullanımı kamera sayfasıyla güvenli çalışmaz.

## 2. Web adresini yapılandırma
`public/index.html` içindeki şu satırı değiştirin:

```js
const SIGNAL_URL='wss://YOUR-SIGNALING-DOMAIN.example';
```

Gerçek WebSocket adresinizle değiştirin (ör. `wss://signal.ornekalanadiniz.com`). Ardından `public/index.html` dosyasını HTTPS üzerinden yayınlayın. Link oluşturucu, açıldığı sayfanın HTTPS adresini kullanarak paylaşım linki üretir.

## 3. TURN sunucusu
STUN bağlantısı bazı ağlarda yeterli olmayabilir. Farklı mobil operatörler, NAT veya kurumsal ağlarda TURN gerekir. Coturn gibi bir TURN servisi kurup kimlik bilgilerini güvenli biçimde yönetin; `public/index.html` içindeki `rtcConfig.iceServers` listesine TURN yapılandırmasını ekleyin. Kalıcı TURN kullanıcı adı/şifresini herkese açık kaynak koduna koymayın; geçici kimlik bilgisi üreten bir backend kullanın.

## 4. Android APK oluşturma
Node.js 20+, Android Studio, Android SDK ve JDK gereklidir.

```bash
npm install
npm run copy-web
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio'da Gradle senkronizasyonunu tamamlayın, sonra **Build > Build APK(s)** seçin. Test APK'sı genellikle `android/app/build/outputs/apk/debug/app-debug.apk` altında oluşur. İmzalı dağıtım APK'sı için Android Studio'da Generate Signed Bundle / APK kullanın. Gerçek derleme bu pakette yapılmış değildir.

Capacitor'ın Android WebView'ında kamera/mikrofon izni için native izin akışını ve WebView `onPermissionRequest` davranışını gerçek cihazda doğrulayın. Gerekirse `android/app/src/main/AndroidManifest.xml` içinde `CAMERA` ve `RECORD_AUDIO` izinlerini tanımlayın ve Android tarafında yalnızca kullanıcı eylemi sırasında izin verin. Sadece manifest izni eklemek WebView medya izni entegrasyonunun eksiksiz olduğu anlamına gelmez.

## Güvenlik ve sınırlamalar
- Davet kimliği rastgele 192-bit hex değeridir ve bağlantı bir kez aynı rol için kullanılabilir.
- Linki bilen kişi davete katılabilir; bu parola veya hesap kimlik doğrulaması değildir. Linki güvenli kanaldan paylaşın.
- Üretim ortamında HTTPS/WSS, hız sınırı, loglarda hassas veri tutmama, sunucu izleme, kısa ömürlü davetler, TURN ve gizlilik bildirimi ekleyin.
- Oda sunucusu görüntü/ses içeriğini işlemez; WebRTC medya akışı peer-to-peer'dır. Ağ topolojisi nedeniyle TURN kullanılırsa medya TURN üzerinden geçebilir.
- Bu proje kaynak başlangıcıdır; APK derlemesi, mobil cihaz testi, sunucu dağıtımı ve güvenlik denetimi tamamlanmadan “hatasız/üretime hazır” kabul edilmemelidir.

## Kolay APK derlemesi (GitHub Actions)

Bu pakete `.github/workflows/build-apk.yml` eklendi. Kaynakları GitHub deposuna yükleyip **Actions → Kamera Izleme APK derle → Run workflow** yolunu izleyerek test APK'sını `Artifacts` bölümünden alabilirsiniz. Adım adım Türkçe talimat için `APK-OLUSTURMA-TR.md` dosyasına bakın.
