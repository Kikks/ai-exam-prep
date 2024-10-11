import { createTokenTracker } from "@/lib/tokens";
import { NextResponse } from "next/server";

export async function GET() {
	const tokenTracker = await createTokenTracker();

	tokenTracker.trackTokens(
		"document_content",
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint maxime, enim non, ipsum odit molestias ratione hic cupiditate iure id ut, animi dolore magnam. Obcaecati laborum corporis aut assumenda quis voluptatibus ex dicta eaque architecto! Iure vel nobis dolores repudiandae ab expedita, ex eligendi itaque repellat saepe doloremque. Sequi dolorem id blanditiis, ab deleniti magnam eos. Similique animi atque corrupti quaerat neque iste repudiandae culpa aspernatur obcaecati numquam optio enim fugiat laudantium doloremque earum unde quos voluptate repellendus ut ipsa, illum a expedita! Maxime, commodi illo quia possimus, amet similique, voluptate blanditiis ducimus inventore nostrum voluptatem id animi nulla sint nihil repellendus? Molestiae magni saepe incidunt dolorem? Suscipit fuga eaque incidunt, facilis similique facere delectus voluptatem rerum harum reiciendis repellat distinctio sunt eligendi inventore ad vero cupiditate fugit aspernatur quia libero earum praesentium debitis officiis! Laboriosam aspernatur laborum quos, ullam repudiandae similique facilis molestiae quaerat atque ea excepturi porro ad, architecto, sit aliquam. Sequi facilis culpa debitis, praesentium maiores fugiat delectus, molest"
	);

	tokenTracker.trackTokens(
		"test_content",
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam officiis porro illo molestiae excepturi quod earum dolorem fugiat dignissimos ad exercitationem, quos optio ipsum ea. Itaque, cupiditate numquam, aperiam iusto exercitationem debitis corrupti voluptatem laudantium, dolorem beatae error suscipit incidunt voluptatibus. Tempora libero repellat facilis omnis, dolor cum beatae quasi sed doloremque rem qui. Aspernatur exercitationem at maiores molestias iure maxime minus commodi quaerat quos voluptate sunt nisi nam quam odit ipsam praesentium dolorem tenetur, quia ratione beatae quae voluptatum distinctio placeat necessitatibus! Autem esse mollitia deserunt quos recusandae a fugiat suscipit qui dicta praesentium, deleniti debitis rerum itaque aut in. Fugiat molestiae magni ducimus necessitatibus voluptate culpa sit dolor voluptas numquam cupiditate facilis aspernatur, itaque provident alias quod iste ab veritatis iure? Iste provident consequatur voluptate id, pariatur ab inventore impedit odit laboriosam. Fugit odit, dolor possimus provident, sunt voluptate sit, quibusdam mollitia distinctio iste amet harum repellendus tempora! Eum voluptatibus soluta dolor quasi maxime aspernatur, sunt alias blanditiis enim ratione odit commodi est obcaecati tempora rem repudiandae laudantium asperiores quod dolores! Iure sunt sit magnam, consequuntur nobis natus suscipit provident vitae deleniti accusantium minima placeat ratione repudiandae quod et mollitia aliquam dicta exercitationem vel odit incidunt soluta ea obcaecati veritatis? Id, aspernatur, reiciendis totam blanditiis asperiores laboriosam non, corrupti laborum similique sequi ex ipsam. Nam aliquam incidunt quia quibusdam. Id consequuntur consequatur eaque non doloremque, nisi fugiat dolor odio cumque neque nulla autem blanditiis libero earum repellendus numquam. Blanditiis mollitia obcaecati, sapiente odit incidunt natus cum ut voluptates magnam totam omnis officia, temporibus a? Perferendis atque aperiam in labore saepe ab eaque veritatis veniam ipsam quas error deserunt adipisci possimus accusamus corporis, et illo ullam quibusdam iure similique expedita ea nulla. Sint quidem officia vero reiciendis ex dicta ab officiis, ipsa iste qui accusantium in, distinctio ratione saepe maiores ullam tempora quasi nulla aut sunt ut non inventore aperiam numquam. Corrupti, doloremque alias quasi laborum eum inventore adipisci delectus suscipit omnis placeat dolorum molestias. Laudantium, aspernatur quod similique quam illo quos exercitationem dolorem voluptates aperiam, esse ducimus minima. Necessitatibus eveniet nam veniam officiis soluta enim reiciendis ad quidem, recusandae ipsum velit laudantium ratione? Rerum recusandae voluptatibus, numquam quis voluptate fugit atque eius, ex earum quidem corrupti. Iusto vitae tempora ducimus iure. Assumenda fuga u"
	);

	tokenTracker.trackTokens("document_content_2", "Lorem ipsum dolor sit amet");

	const tokenCounts = tokenTracker.getTokenCounts();
	const totalTokens = tokenTracker.getTotalTokens();

	return NextResponse.json(
		{
			tokenCounts,
			totalTokens
		},
		{ status: 200 }
	);
}
