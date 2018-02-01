module.exports = {
	files: {
		allow: [
			'.bowerignore'
		],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'62a990fd8dce4a27aafb006b58783f66@sentry.io', // browser/bundles/o-errors.js:11
			'62a990fd8dce4a27aafb006b58783f66', // browser/bundles/o-errors.js:11|11
			'2dd640a6-6ebd-4d4f-af30-af8baa441a0d', // components/n-ui/ads/js/krux.js:55
			'e4942ff0-4070-4896-a7ef-e6a5a30ce9f9', // components/n-ui/ads/js/krux.js:68
			'2111c0af-fc3a-446f-ab07-63aa74fbde8e', // components/n-ui/ads/js/krux.js:75
			'05a3d326-9abe-5885-4ee2-8d58d9a9a4ea', // components/n-ui/header/js/promoHandler.js:70
			'27e66825-bc4f-ba59-a3cd-1a8f08579bfe', // components/n-ui/header/partials/marketing-promo/template.html:4
			'676c655f-9b47-27a8-97db-ab3a6a6dbc54', // server/models/anon.js:14
			'190b4443-dc03-bd53-e79b-b4b6fbd04e64', // server/test/fixtures/navigationLists.json:13|3037, server/test/stubs/navigationListData.json:13|4922
			'navigationModelV2Stub', // server/test/navigation/navigation.test.js:7|15|20|29
			'NavigationModelV2Stub', // server/test/navigation/navigation.test.js:10|11
			'1e3927c2-475d-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3017|3297|4005|4284
			'c63264a4-47f1-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3021|4009|4061
			'1a8c803e-452c-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3025|3625|4013|4612
			'f518df5e-4784-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3029|4017
			'77a20970-474c-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3033|4021
			'7939901e-4756-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3074
			'7a00067c-477e-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3078
			'a54d870e-4752-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3082|3613|4600
			'63e937b0-44fd-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3086|3617|4604
			'fdf19d7c-475d-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3090
			'237ab9e6-4724-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3301|4288
			'461689a4-4769-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3305|4292
			'17bedd60-4771-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3309|4296
			'5741129a-4510-11e6-b22f-79eb4891c97d', // server/test/stubs/navigationListData.json:3313|3453|4300|4440
			'c753b5d0-474d-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3437|4424
			'20142754-2cc3-11e6-bf8d-26294ad519fc', // server/test/stubs/navigationListData.json:3441|4428
			'1bab72d6-4716-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:3445|4432
			'648d8e44-ac31-358b-bbbc-4375352448ae', // server/test/stubs/navigationListData.json:3449|4436
			'53fc4518-4520-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3609|4596
			'cb1f3d82-4753-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3621|4608
			'442502c6-442e-11e6-b22f-79eb4891c97d', // server/test/stubs/navigationListData.json:3682|4669
			'43a6e272-4462-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3686|4673
			'8465df96-44e6-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3690|4677
			'0269dca2-4461-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:3694|4681
			'f09cf0ea-241c-11e6-aa98-db1e01fabc0c', // server/test/stubs/navigationListData.json:3698|4685
			'896aaa54-12bf-11e4-93a5-00144feabdc0', // server/test/stubs/navigationListData.json:3861|4848
			'f4dedd92-43c7-11e6-b22f-79eb4891c97d', // server/test/stubs/navigationListData.json:3865|4852
			'baa6478e-4528-11e6-b22f-79eb4891c97d', // server/test/stubs/navigationListData.json:3869|4856
			'2c4c90cc-3e59-11e6-8716-a4a71e8140b0', // server/test/stubs/navigationListData.json:3873|4860
			'3ed9c392-4767-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:3877|4864
			'0abedc06-452c-11e6-9b66-0712b3873ae1', // server/test/stubs/navigationListData.json:4065
			'2be49f84-47c9-11e6-b387-64ab0a67014c', // server/test/stubs/navigationListData.json:4069
			'992c9ee6-46bd-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:4073
			'dc3e168e-46b2-11e6-8d68-72e9211e86ab', // server/test/stubs/navigationListData.json:4077
			'cc7742a4-e17e-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2511|3023|4178|4271|4700
			'4c1594c6-e18d-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2515|4182|4275
			'231579ce-e165-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2519|4186|4279
			'c261414c-dcfc-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:2523|4190|4283
			'161d4040-e1c8-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2527|4194
			'af707ac0-e216-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2594
			'0d48300a-de3b-11e6-86ac-f253db7791c6', // server/test/stubs/navigationv2Data.json:2598
			'26bc7324-d28c-377b-bc73-d65192d59a6b', // server/test/stubs/navigationv2Data.json:2602
			'304df3ba-e15a-11e6-9645-c9357a75844a', // server/test/stubs/navigationv2Data.json:2606
			'1800ee84-e173-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:2610
			'2acabb7a-def9-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:3027|4704
			'f71f345e-e150-11e6-9645-c9357a75844a', // server/test/stubs/navigationv2Data.json:3031|4708
			'f1027f38-e207-11e6-9645-c9357a75844a', // server/test/stubs/navigationv2Data.json:3035|4712
			'3c26c7fc-e187-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:3039|4716
			'e1fd430a-e14f-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:3292|4969
			'67be8118-df3c-11e6-86ac-f253db7791c6', // server/test/stubs/navigationv2Data.json:3296|4287|4973
			'60c23bd8-dd16-3b07-9d8a-62ed73557cd7', // server/test/stubs/navigationv2Data.json:3300|4977
			'4115a710-e1b4-11e6-9645-c9357a75844a', // server/test/stubs/navigationv2Data.json:3304|4981
			'5a032884-e168-11e6-8405-9e5580d6e5fb', // server/test/stubs/navigationv2Data.json:3308|4985
			'98d74346-de67-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:3574|5251
			'c6d8f574-cd0e-11e6-864f-20dcb35cede2', // server/test/stubs/navigationv2Data.json:3578|5255
			'1d248370-d42c-11e6-9341-7393bb2e1b51', // server/test/stubs/navigationv2Data.json:3582|5259
			'058c4b48-d43c-11e6-9341-7393bb2e1b51', // server/test/stubs/navigationv2Data.json:3586|5263
			'26ca7840-dd77-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:3590|5267
			'44478b7e-dd09-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:3906|5583
			'40cae4c8-d7fa-11e6-944b-e7eb37a6aa8e', // server/test/stubs/navigationv2Data.json:3910|5587
			'0fee75c6-dd73-11e6-9d7c-be108f1c1dce', // server/test/stubs/navigationv2Data.json:3914|5591
			'c225ddde-d85b-11e4-ba53-00144feab7de', // server/test/stubs/navigationv2Data.json:3918|5595
			'0f3e15c2-dc07-11e6-86ac-f253db7791c6', // server/test/stubs/navigationv2Data.json:3922|5599
			'/circleci/project/github/RedSparr0w/node' // README.md:1
		]
	}
};
