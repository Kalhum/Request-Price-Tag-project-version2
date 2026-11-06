"use client";

function PriceTag() {
  return (
    <div className="w-full border-2 border-black bg-white p-2 text-black">
      <div className="flex justify-between text-[9px]">
        <span>05/01/2026</span>
        <span>P0000</span>
      </div>

      {/* Barcode */}
      <div
        className="mt-1 h-9 w-full bg-white"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #111 0px, #111 1px, transparent 1px, transparent 3px, #111 3px, #111 5px, transparent 5px, transparent 7px)",
        }}
      />

      <div className="flex justify-between text-[8px]">
        <span>438 D</span>
        <span>NR</span>
        <span>10450048</span>
        <span>885099320007</span>
      </div>

      <div className="mt-1 flex items-end justify-end">
        <span className="text-[42px] font-black leading-none">14</span>
        <span className="mb-1 text-lg font-bold">.00</span>
      </div>

      <div className="mt-1 flex items-center gap-1">
        <div className="flex h-6 w-7 items-center justify-center border-2 border-black text-caption">
          O
        </div>
      </div>

      <p className="mt-1 text-label font-medium">สิงห์น้ำดื่ม 1500มล.</p>
      <p className="text-[8px]">Singha Drinking Water 1500ml.</p>
    </div>
  );
}

function PriceTagPreview() {
  return (
    <section className="w-[220px] shrink-0">
      <h2 className="mb-6 text-center text-label font-bold">
        ตัวอย่างป้ายราคา
      </h2>

      <div className="card-default flex max-h-[470px] flex-col gap-2 overflow-auto p-2">
        {[1, 2, 3, 4,5,6,7,8].map((item) => (
          <PriceTag key={item} />
        ))}
      </div>
    </section>
  );
}

function WelcomeBanner() {
  return (
    <section className="rounded-card bg-linear-to-r from-primary to-secondary px-4 py-3 text-white shadow-card">
      <h2 className="text-heading font-medium">
        Request Price Tags to SAHA Lawson
      </h2>

      <p className="mt-3 text-label leading-6">
        เป็นเว็บไซต์สำหรับหน้าร้านที่ต้องการร้องขอป้ายราคาจากทางสห ลอว์สัน
        <br />
        *** การจัดลำดับ Tier list เป็นข้อมูลล่าสุดของเดือน 05/2026
        <span className="text-danger-light"> (ข้อมูลที่แสดงยังไม่เป็นทางการ)</span>
      </p>
    </section>
  );
}

function WebsiteInfo() {
  return (
    <section className="card-default mt-14 w-[285px] p-6">
      <h2 className="text-subheading font-bold">ที่อยู่เว็บไซต์</h2>

      <p className="mt-4 text-subheading font-medium">
        <span className="text-danger">SAHA</span>{" "}
        <span className="text-secondary">LAWSON</span>
      </p>

      <p className="mt-5 break-all text-caption text-gray">
        http://www.chokchaipibul.com/reqpricetag
      </p>

      <p className="my-3 text-caption text-gray">หรือ</p>

      <p className="break-all text-caption text-gray">
        http://115.31.146.18/reqpricetag/
      </p>
    </section>
  );
}

export default function Homepage() {
  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-layout p-layout max-lg:grid-cols-1">
      <PriceTagPreview />

      <div className="min-w-0">
        <WelcomeBanner />
        <WebsiteInfo />
      </div>
    </div>
  );
}