export default function Footer() {
  return (
    <footer className="mt-auto rounded-card bg-white px-4 py-5 text-gray shadow-card sm:px-6">
      {/* layout: stack on mobile, 2 col on sm+ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

        {/* บริษัท + ที่อยู่ */}
        <p className="text-label leading-relaxed sm:text-body">
          <b>บริษัท สห ลอว์สัน จำกัด</b>{" "}
          <span className="block sm:inline">
            2170 ชั้นที่ 3 อาคารกรุงเทพ ทาวเวอร์ ถนนเพชรบุรีตัดใหม่
            แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310
          </span>
        </p>

        {/* ข้อมูลติดต่อ */}
        <div className="flex flex-col gap-0.5 text-right text-label sm:text-body sm:shrink-0">
          <p className="text-right">โทร. 0-2308-0703</p>
          <p className="text-right">โทรสาร 0-2308-0701-2</p>
          <p className="text-right">Email: info@sahalawson.co.th</p>
        </div>
      </div>
    </footer>
  );
}
