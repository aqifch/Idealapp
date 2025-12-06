import imgRectangle7 from "figma:asset/0b591b96a0d95274aec2c79ce5f7c8b0c0dbae09.png";

function Group() {
  return (
    <div className="relative shrink-0 size-[21.62px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Group 3">
          <circle cx="10.8099" cy="10.8099" fill="var(--fill-0, #FF9431)" id="Ellipse 13" r="10.8099" />
          <g id="Group 1">
            <line id="Line 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="1.35124" x1="10.7134" x2="10.7134" y1="6.0806" y2="15.5393" />
            <line id="Line 2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="1.35124" x1="6.08056" x2="15.5392" y1="10.9064" y2="10.9064" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#ff9431] text-[0px] text-nowrap tracking-[-0.5045px] whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        <span className="text-[16.815px]">Rs 22.</span>
        <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[12.011px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          00
        </span>
      </p>
      <Group />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.603px] h-[78.372px] items-start left-[19.92px] top-[128.82px] w-[118.008px]">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] opacity-90 relative shrink-0 text-[#0d0d0d] text-[16.215px] tracking-[-0.4864px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Boomb Pizza
      </p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#0d0d0d] text-[10.81px] tracking-[-0.3243px] w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`200 gr chicken + cheese  Lettuce + tomato`}</p>
      <Frame />
    </div>
  );
}

export default function Group1() {
  return (
    <div className="relative shadow-[36.033px_34.231px_59.455px_0px_rgba(0,0,0,0.02)] size-full">
      <div className="absolute bg-white h-[221.496px] left-0 rounded-[19.492px] shadow-[3.713px_3.713px_12.995px_0px_rgba(0,0,0,0.15)] top-[4.5px] w-[155.141px]" />
      <div className="absolute h-[136.086px] left-[18.12px] shadow-[1.616px_3.232px_8.079px_0px_rgba(0,0,0,0.2),3.232px_3.232px_8.079px_0px_rgba(0,0,0,0.15)] top-0 w-[119.258px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgRectangle7} />
      </div>
      <Frame1 />
    </div>
  );
}