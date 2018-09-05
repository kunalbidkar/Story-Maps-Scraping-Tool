/*
	This function is dedicated to parse the data for Map Tour.
	It takes two parameters, the actual item data and the item id and returns an parsedItem object
	This function makes few checks if the given item has facebook enabled, twiter enabled, 
	image sources for the item, theme, layout and template versions. 
*/
function parseTourData(item, id) {
	let facebookStatus = "0";
	let twitterStatus = "0";
	let bitlyStatus = "0";
	let orderCount = "0";
	let layoutInfo = "0";
	let title = "FALSE";
	let version = "FALSE";
	let zoomLevelInfo = "FALSE";
	let logoUrlInfo = "FALSE";
	let headerUrlInfo = "FALSE";
	let sourceLayerInfo = "FALSE";
	let theme = "";
	let itemIdentifier = id;
	let isArcGISSource = "0";
	let isGoogleSource = "0";
	let isFlickrSource = "0";
	let isUnsplashSource = "0";
	let isOtherSource = "0";
	let isYoutubeSource = "0";
	let isVimeoSource = "0";
	if (item.hasOwnProperty("values")) {
		if (item.values.hasOwnProperty("social")) {
			if (item.values.social.hasOwnProperty("facebook"))
				facebookStatus = item.values.social.facebook;
			if (item.values.social.hasOwnProperty("twitter"))
				twitterStatus = item.values.social.twitter;
			if (item.values.social.hasOwnProperty("bitly"))
				bitlyStatus = item.values.social.bitly;
		}

		if (item.values.hasOwnProperty("theme")) theme = item.values.theme;
		if (item.values.hasOwnProperty("title")) titleInfo = item.values.title;
		if (item.values.hasOwnProperty("order") && item.values.order)
			orderCount = item.values.order.length;
		if (item.values.hasOwnProperty("sourceLayer"))
			sourceLayerInfo = item.values.sourceLayer;
		if (item.values.hasOwnProperty("zoomLevel"))
			zoomLevelInfo = item.values.zoomLevel;
		if (item.values.hasOwnProperty("headerLinkURL"))
			headerUrlInfo = item.values.headerLinkURL;
		if (item.values.hasOwnProperty("logoURL"))
			logoUrlInfo = item.values.logoURL;
		if (item.values.hasOwnProperty("layout"))
			layoutInfo = item.values.layout;
		if (item.values.hasOwnProperty("templateVersion"))
			version = item.values.templateVersion;
	}

	const parsedItem = {
		itemId: itemIdentifier,
		layout: layoutInfo,
		numSections: orderCount,
		twitterEbabled: twitterStatus,
		facebookEnabled: facebookStatus,
		templateVersion: version,
		sourceLayer: sourceLayerInfo,
		zoomLevel: zoomLevelInfo,
		bitlyEnabled: bitlyStatus
	};

	return parsedItem;
}

/*
	This function is dedicated to parse the data for Cascade.
	It takes two parameters, the actual item data and the item id and returns an parsedItem object
	This function makes few checks the image source, video sources and their counts, number of sections,
	number of maps, number of unique maps etc. 
*/
function parseCascadeData(item, id) {
	let createdTime = "FALSE";
	let editedTime = "FALSE";
	let dataVersioning = "FALSE";
	let sectionCount = "FALSE";
	let isShadowUsed = "FALSE";
	let textSection = "FALSE";
	let backgroundSection = "FALSE";
	let mapIds = [];
	let uniqueChecker = false;
	let uniqueMapId = [];
	let numWebScenesArray = [];
	let imageCounter = [];
	let videoCounter = [];
	let itemIdentifier = id;
	let isArcGISSource = "0";
	let isGoogleSource = "0";
	let isFlickrSource = "0";
	let isUnsplashSource = "0";
	let isOtherSource = "0";
	let isYoutubeSource = "0";
	let isVimeoSource = "0";

	if (item.hasOwnProperty("values")) {
		if (item.values.hasOwnProperty("template")) {
			createdTime = item.values.template.createdWith;
			editedTime = item.values.template.editedWith;
			dataVersioning = item.values.template.dataVersion;
		}
		if (item.values.hasOwnProperty("sections")) {
			let sectionCount = item.values.sections.length;
			item.values.sections.forEach(function(element) {
				let imageURL = "";
				let videoURL = "";

				if (element.hasOwnProperty("foreground")) {
					if (element.foreground.hasOwnProperty("blocks")) {
						element.foreground.blocks.forEach(elements => {
							if (elements.hasOwnProperty("type")) {
								if (elements.type == "webmap") {
									mapIds.push(elements.webmap.id);
								}
							}
						});
					}
				}

				// for section type = "title"
				if (element.hasOwnProperty("type")) {
					if (element.type == "title") {
						if (element.hasOwnProperty("background")) {
							if (element.background.hasOwnProperty("type")) {
								if (element.background.type == "image") {
									if (
										element.background.image.hasOwnProperty(
											"url"
										)
									) {
										if (
											element.background.image.url !=
											undefined
										) {
											imageCounter.push(
												element.background.image.url
											);

											imageURL =
												element.background.image.url;

											if (imageURL === undefined)
												noMedia = true;
											else {
												if (
													imageURL.includes("arcgis")
												) {
													isArcGISSource = "1";
												}
												if (
													imageURL.includes(
														"unsplash"
													)
												) {
													isUnsplashSource = "1";
												}
												if (
													imageURL.includes("google")
												) {
													isGoogleSource = "1";
												}
												if (
													imageURL.includes("flickr")
												) {
													isFlickrSource = "1";
												}
												if (
													!imageURL.includes(
														"google"
													) &&
													!imageURL.includes(
														"arcgis"
													) &&
													!imageURL.includes("flickr")
												) {
													isOtherSource = "1";
												}
											}
										}
									}
								}
							}
						}
					}

					// for section type = "cover"
					if (element.type == "cover") {
						if (element.hasOwnProperty("background")) {
							// check if the background has a image or a video
							// If the background is an image
							if (element.background.hasOwnProperty("type")) {
								if (element.background.type == "image") {
									if (
										element.background.image.url !==
										undefined
									) {
										imageCounter.push(
											element.background.image.url
										);
										imageURL = element.background.image.url;
										if (imageURL === undefined)
											noMedia = true;
										else {
											if (imageURL.includes("arcgis")) {
												isArcGISSource = "1";
											}
											if (imageURL.includes("google")) {
												isGoogleSource = "1";
											}
											if (imageURL.includes("flickr")) {
												isFlickrSource = "1";
											}
											if (imageURL.includes("unsplash")) {
												isUnsplashSource = "1";
											}
											if (
												!imageURL.includes("google") &&
												!imageURL.includes("arcgis") &&
												!imageURL.includes("flickr")
											) {
												isOtherSource = "1";
											}
										}
									}
								}
								//If the background is a video
								if (element.background.type == "video") {
									videoCounter.push(1);
									if (
										element.background.video.hasOwnProperty(
											"source"
										)
									) {
										if (
											element.background.video.source !==
											undefined
										) {
											if (
												element.background.video
													.source == "vimeo"
											)
												isVimeoSource = "1";
											if (
												element.background.video
													.source == "youtube"
											)
												isYoutubeSource = "1";
										}
									}

									if (
										element.background.hasOwnProperty(
											"alternate"
										)
									) {
										if (
											element.background.alternate.hasOwnProperty(
												"type"
											)
										) {
											if (
												element.background.alternate
													.type == "image"
											) {
												if (
													element.background.alternate
														.image.url != undefined
												) {
													imageCounter.push(
														element.background
															.alternate.image.url
													);
													imageURL =
														element.background
															.alternate.image
															.url;
													if (imageURL === undefined)
														noMedia = true;
													else {
														if (
															imageURL.includes(
																"unsplash"
															)
														) {
															isUnsplashSource =
																"1";
														}
														if (
															imageURL.includes(
																"arcgis"
															)
														) {
															isArcGISSource =
																"1";
														}
														if (
															imageURL.includes(
																"google"
															)
														) {
															isGoogleSource =
																"1";
														}
														if (
															imageURL.includes(
																"flickr"
															)
														) {
															isFlickrSource =
																"1";
														}
														if (
															!imageURL.includes(
																"google"
															) &&
															!imageURL.includes(
																"arcgis"
															) &&
															!imageURL.includes(
																"flickr"
															)
														) {
															isOtherSource = "1";
														}
													}
												}
											}
											if (
												element.background.alternate
													.type == "video"
											) {
												videoCounter.push(1);
												if (
													element.background.alternate
														.video.url != undefined
												) {
													videoURL =
														element.background
															.alternate.video
															.url;
													if (
														videoURL.includes(
															"vimeo"
														)
													)
														isVimeoSource = "1";
													if (
														videoURL.includes(
															"youtube"
														)
													)
														isYoutubeSource = "1";
												}
											}
										}
									}
								}
							}
						}
					}
					// for section type = "sequence"
					if (element.type == "sequence") {
						if (element.hasOwnProperty("foreground")) {
							if (element.foreground.hasOwnProperty("blocks")) {
								element.foreground.blocks.forEach(function(
									elements
								) {
									if (elements.hasOwnProperty("type")) {
										if (elements.type == "image") {
											if (
												elements.image.hasOwnProperty(
													"url"
												)
											) {
												imageCounter.push(
													elements.image.url
												);
												imageURL = elements.image.url;
												if (imageURL === undefined)
													noMedia = true;
												else {
													if (
														imageURL.includes(
															"unsplash"
														)
													) {
														isUnsplashSource = "1";
													}
													if (
														imageURL.includes(
															"arcgis"
														)
													) {
														isArcGISSource = "1";
													}
													if (
														imageURL.includes(
															"google"
														)
													) {
														isGoogleSource = "1";
													}
													if (
														imageURL.includes(
															"flickr"
														)
													) {
														isFlickrSource = "1";
													}
													if (
														!imageURL.includes(
															"google"
														) &&
														!imageURL.includes(
															"arcgis"
														) &&
														!imageURL.includes(
															"flickr"
														)
													) {
														isOtherSource = "1";
													}
												}
											}
										}
										if (elements.type == "webscene") {
											if (
												elements.webscene.hasOwnProperty(
													"id"
												)
											) {
												numWebScenesArray.push(
													elements.webscene.id
												);
											}
										}

										if (elements.type == "webpage") {
											if (
												elements.hasOwnProperty(
													"alternate"
												)
											) {
												if (
													elements.alternate.hasOwnProperty(
														"type"
													)
												) {
													if (
														elements.alternate
															.type == "image"
													) {
														if (
															elements.alternate.image.hasOwnProperty(
																"url"
															)
														) {
															imageCounter.push(
																elements
																	.alternate
																	.image.url
															);
															imageURL =
																elements
																	.alternate
																	.image.url;
															if (
																imageURL ===
																undefined
															)
																noMedia = true;
															else {
																if (
																	imageURL.includes(
																		"unsplash"
																	)
																) {
																	isUnsplashSource =
																		"1";
																}
																if (
																	imageURL.includes(
																		"arcgis"
																	)
																) {
																	isArcGISSource =
																		"1";
																}
																if (
																	imageURL.includes(
																		"google"
																	)
																) {
																	isGoogleSource =
																		"1";
																}
																if (
																	imageURL.includes(
																		"flickr"
																	)
																) {
																	isFlickrSource =
																		"1";
																}
																if (
																	!imageURL.includes(
																		"google"
																	) &&
																	!imageURL.includes(
																		"arcgis"
																	) &&
																	!imageURL.includes(
																		"flickr"
																	)
																) {
																	isOtherSource =
																		"1";
																}
															}
														}
													}
													if (
														elements.alternate
															.type == "video"
													) {
														if (
															elements.alternate.video.hasOwnProperty(
																"url"
															)
														) {
															videoCounter.push(
																elements
																	.alternate
																	.video.url
															);
															videoURL =
																elements
																	.alternate
																	.video.url;
															if (
																videoURL.includes(
																	"vimeo"
																)
															)
																isVimeoSource =
																	"1";
															if (
																videoURL.includes(
																	"youtube"
																)
															)
																isYoutubeSource =
																	"1";
														}
													}
												}
											}
										}
										if (elements.type == "image-gallery") {
											if (
												elements[
													"image-gallery"
												].hasOwnProperty("images")
											) {
												if (
													elements[
														"image-gallery"
													].images.hasOwnProperty(
														"url"
													)
												) {
													if (
														elements[
															"image-gallery"
														].images[0].url !=
														undefined
													) {
														imageURL =
															elements[
																"image-gallery"
															].images[0].url;
														var numImages =
															elements[
																"image-gallery"
															].images.length;
														for (
															var i = 0;
															i < numImages;
															i++
														) {
															imageCounter.push(
																i
															);
														}
														if (
															imageURL ===
															undefined
														)
															noMedia = true;
														else {
															if (
																imageURL.includes(
																	"unsplash"
																)
															) {
																isUnsplashSource =
																	"1";
															}
															if (
																imageURL.includes(
																	"arcgis"
																)
															) {
																isArcGISSource =
																	"1";
															}
															if (
																imageURL.includes(
																	"google"
																)
															) {
																isGoogleSource =
																	"1";
															}
															if (
																imageURL.includes(
																	"flickr"
																)
															) {
																isFlickrSource =
																	"1";
															}
															if (
																!imageURL.includes(
																	"google"
																) &&
																!imageURL.includes(
																	"arcgis"
																) &&
																!imageURL.includes(
																	"flickr"
																)
															) {
																isOtherSource =
																	"1";
															}
														}
													}
												}
											}
										}
									}
								});
							}
						}
					}

					// for section type = "immersive"
					if (element.type == "immersive") {
						if (element.hasOwnProperty("views")) {
							//console.log(element);
							element.views.forEach(function(item) {
								if (
									item.transition == "fade-fast" ||
									item.transition == "none" ||
									item.transition == "swipe-horizontal" ||
									item.transition == "swipe-vertical" ||
									item.transition == "fade-slow"
								) {
									if (item.hasOwnProperty("background")) {
										if (
											item.background.hasOwnProperty(
												"type"
											)
										) {
											if (
												item.background.type == "image"
											) {
												if (
													item.background.image.hasOwnProperty(
														"url"
													)
												) {
													imageCounter.push(
														item.background.image
															.url
													);
													imageURL =
														item.background.image
															.url;
													if (imageURL === undefined)
														noMedia = true;
													else {
														if (
															imageURL.includes(
																"unsplash"
															)
														) {
															isUnsplashSource =
																"1";
														}
														if (
															imageURL.includes(
																"arcgis"
															)
														) {
															isArcGISSource =
																"1";
														}
														if (
															imageURL.includes(
																"google"
															)
														) {
															isGoogleSource =
																"1";
														}
														if (
															imageURL.includes(
																"flickr"
															)
														) {
															isFlickrSource =
																"1";
														}
														if (
															!imageURL.includes(
																"google"
															) &&
															!imageURL.includes(
																"arcgis"
															) &&
															!imageURL.includes(
																"flickr"
															)
														) {
															isOtherSource = "1";
														}
													}
												}
											}
										}
									}
								}

								if (item.hasOwnProperty("background")) {
									if (
										item.background.hasOwnProperty("type")
									) {
										if (item.background.type == "webmap") {
											if (
												item.background.webmap.hasOwnProperty(
													"id"
												)
											)
												mapIds.push(
													item.background.webmap.id
												);
										}
										if (
											item.background.type == "webscene"
										) {
											if (
												item.background.hasOwnProperty(
													"webscene"
												)
											) {
												if (
													item.background.webscene.hasOwnProperty(
														"id"
													)
												)
													numWebScenesArray.push(
														item.background.webscene
															.id
													);
											}
										}

										if (item.background.type == "video") {
											videoCounter.push(1);
											if (
												item.background.video.hasOwnProperty(
													"url"
												)
											) {
												videoURL =
													item.background.video.url;
												if (videoURL.includes("vimeo"))
													isVimeoSource = "1";
												if (
													videoURL.includes("youtube")
												)
													isYoutubeSource = "1";
											}
										}
									}
								}

								if (item.hasOwnProperty("foreground")) {
									if (
										item.foreground.hasOwnProperty("panels")
									) {
										if (
											item.foreground.panels[0].hasOwnProperty(
												"blocks"
											)
										) {
											item.foreground.panels[0].blocks.forEach(
												function(items) {
													if (
														items.hasOwnProperty(
															"type"
														)
													) {
														if (
															items.type ==
															"webscene"
														) {
															if (
																items.webscene.hasOwnProperty(
																	"id"
																)
															)
																numWebScenesArray.push(
																	items
																		.webscene
																		.id
																);
														}

														if (
															items.type ==
															"image"
														) {
															if (
																items.hasOwnProperty(
																	"image"
																)
															) {
																if (
																	items.image.hasOwnProperty(
																		"url"
																	)
																) {
																	imageCounter.push(
																		items
																			.image
																			.url
																	);
																	imageURL =
																		items
																			.image
																			.url;
																	if (
																		imageURL ===
																		undefined
																	)
																		noMedia = true;
																	else {
																		if (
																			imageURL.includes(
																				"unsplash"
																			)
																		) {
																			isUnsplashSource =
																				"1";
																		}
																		if (
																			imageURL.includes(
																				"arcgis"
																			)
																		) {
																			isArcGISSource =
																				"1";
																		}
																		if (
																			imageURL.includes(
																				"google"
																			)
																		) {
																			isGoogleSource =
																				"1";
																		}
																		if (
																			imageURL.includes(
																				"flickr"
																			)
																		) {
																			isFlickrSource =
																				"1";
																		}
																		if (
																			!imageURL.includes(
																				"google"
																			) &&
																			!imageURL.includes(
																				"arcgis"
																			) &&
																			!imageURL.includes(
																				"flickr"
																			)
																		) {
																			isOtherSource =
																				"1";
																		}
																	}
																}
															}
														}
													}
												}
											);
										}
									}
								}
							});
						}
					}
				}
			});

			if (item.values.sections[0].hasOwnProperty("foreground")) {
				if (
					item.values.sections[0].foreground.hasOwnProperty("options")
				) {
					if (
						item.values.sections[0].foreground.options.hasOwnProperty(
							"titleStyle"
						)
					) {
						isShadowUsed =
							item.values.sections[0].foreground.options
								.titleStyle.shadow;
						backgroundSection =
							item.values.sections[0].foreground.options
								.titleStyle.background;
						textSection =
							item.values.sections[0].foreground.options
								.titleStyle.text;
					}
				}
			}
		}
	}

	uniqueMapIds = removeDuplicates(mapIds);
	uniqueWebSceneArray = removeDuplicates(numWebScenesArray);

	const parsedItem = {
		itemID: itemIdentifier,
		templateCreatedWith: createdTime,
		templateEditedWith: editedTime,
		templateDataVersion: dataVersioning,
		sectionShadowUsed: isShadowUsed,
		sectionTextUsed: textSection,
		sectionBackground: backgroundSection,
		numSections: sectionCount,
		flickr: isFlickrSource,
		google: isGoogleSource,
		arcgis: isArcGISSource,
		unsplash: isUnsplashSource,
		linkedImage: isOtherSource,
		youtube: isYoutubeSource,
		vimeo: isVimeoSource,
		numMaps: mapIds.length,
		uniqueMaps: uniqueMapIds.length,
		numWebScenes: numWebScenesArray.length,
		uniqueWebScenes: uniqueWebSceneArray.length,
		numImages: imageCounter.length,
		numVideos: videoCounter.length
	};

	return parsedItem;
}
/*
	This function is dedicated to parse the data for Map Journal.
	It takes two parameters, the actual item data and the item id and returns an parsedItem object
	This function makes few checks the image source, video sources and their counts, number of sections,
	number of maps, number of unique maps etc. 
*/
function parseJournalData(item, id) {
	let headerURL = "FALSE";
	let logoTarget = "FALSE";
	let logoColor = "FALSE";
	let themeColor = "FALSE";
	let lSize = "FALSE";
	let social = "FALSE";
	let templateCreation = "FALSE";
	let numSections = "FALSE";
	let templateEdited = "FALSE";
	let layoutId = "false";
	let imgDisplay = "false";
	let firstImageInSection = true;
	let isArcGISSource = "0";
	let isGoogleSource = "0";
	let isFlickrSource = "0";
	let isUnsplashSource = "0";
	let isOtherSource = "0";
	let isYoutubeSource = "0";
	let isVimeoSource = "0";

	let mapIds = [];
	let uniqueMapIds = [];
	let imageCounter = [];
	let videoCounter = [];
	let itemIdentifier = id;
	if (item.values != undefined) {
		if (item.hasOwnProperty("values")) {
			if (item.values.hasOwnProperty("settings")) {
				if (item.values.settings.hasOwnProperty("layout")) {
					if (item.values.settings.layout.hasOwnProperty("id")) {
						layoutId = item.values.settings.layout.id;
					}
				}

				if (item.values.settings.hasOwnProperty("theme")) {
					if (item.values.settings.theme.hasOwnProperty("colors")) {
						if (
							item.values.settings.theme.colors.hasOwnProperty(
								"themeMajor"
							)
						) {
							themeColor =
								item.values.settings.theme.colors.themeMajor;
						}
						if (
							item.values.settings.theme.colors.hasOwnProperty(
								"esriLogo"
							)
						) {
							logoColor =
								item.values.settings.theme.colors.esriLogo;
						}
					}
				}

				if (item.values.settings.hasOwnProperty("header")) {
					if (item.values.settings.header.hasOwnProperty("linkURL"))
						headerURL = item.values.settings.header.linkURL;
					if (
						item.values.settings.header.hasOwnProperty("logoTarget")
					)
						logoTarget = item.values.settings.header.logoTarget;
				}
				if (item.values.settings.hasOwnProperty("layoutOptions")) {
					if (
						item.values.settings.layoutOptions.hasOwnProperty(
							"layoutCfg"
						)
					) {
						if (
							item.values.settings.layoutOptions.layoutCfg.hasOwnProperty(
								"size"
							)
						)
							lSize =
								item.values.settings.layoutOptions.layoutCfg
									.size;
					}
					if (
						item.values.settings.layoutOptions.hasOwnProperty(
							"socialLinks"
						)
					)
						social = item.values.settings.layoutOptions.socialLinks;
				}
			}

			if (item.values.hasOwnProperty("story")) {
				if (item.values.story.hasOwnProperty("sections")) {
					sectionCount = item.values.story.sections.length;

					item.values.story.sections.forEach(function(items) {
						if (items.hasOwnProperty("media")) {
							if (items.media.hasOwnProperty("type")) {
								if (items.media.type == "image") {
									imageCounter.push(1);
									if (items.media.hasOwnProperty("image")) {
										if (
											items.media.image.hasOwnProperty(
												"display"
											) &&
											firstImageInSection == true
										) {
											imgDisplay =
												items.media.image.display;
											firstImageInSection = false;
										}

										if (
											items.media.image.hasOwnProperty(
												"url"
											)
										) {
											imageURL = items.media.image.url;
											//checkImageSource(imageURL);
											if (imageURL.includes("arcgis")) {
												isArcGISSource = "1";
											}
											if (imageURL.includes("google")) {
												isGoogleSource = "1";
											}
											if (imageURL.includes("flickr")) {
												isFlickrSource = "1";
											}
											if (
												!imageURL.includes("google") &&
												!imageURL.includes("arcgis") &&
												!imageURL.includes("flickr")
											) {
												isOtherSource = "1";
											}
										}
									}
								}
								if (items.media.type == "video") {
									videoCounter.push(1);
									if (items.media.hasOwnProperty("video")) {
										if (
											items.media.video.hasOwnProperty(
												"url"
											)
										) {
											videoURL = items.media.video.url;
											//checkVideoSource(videoURL);
											if (videoURL.includes("vimeo"))
												isVimeoSource = "1";
											if (videoURL.includes("youtube"))
												isYoutubeSource = "1";
										}
									}
								}

								// number of maps
								if (items.media.type == "webmap") {
									if (items.media.webmap.hasOwnProperty("id"))
										mapIds.push(items.media.webmap.id);
								}
							}
						}

						// number of maps continued in contentActions array
						if (items.hasOwnProperty("contentActions")) {
							items.contentActions.forEach(function(element) {
								if (element.hasOwnProperty("media")) {
									if (element.media.type == "webmap") {
										if (
											element.media.webmap.hasOwnProperty(
												"id"
											)
										)
											mapIds.push(
												element.media.webmap.id
											);
									}
								}
							});
						}
					});
				}
			}

			if (item.values.hasOwnProperty("template")) {
				templateCreation = item.values.template.createdWith;
				templateEdited = item.values.template.editedWith;
			}
		}
	}

	let index = 0;
	uniqueMapIds = mapIds.slice(0); // copying all the elements from mapIds (Cloning)

	uniqueMapIds = removeDuplicates(mapIds);

	const parsedItem = {
		itemID: itemIdentifier,
		layout: layoutId,
		layoutSize: lSize,
		imageDisplay: imgDisplay,
		socialLinks: social,
		themeMajorColor: themeColor,
		esriLogoColor: logoColor,
		templateCreatedWith: templateCreation,
		templateEditedWith: templateEdited,
		numSections: sectionCount,
		arcgis: isArcGISSource,
		flickr: isFlickrSource,
		google: isGoogleSource,
		linkedImage: isOtherSource,
		youtube: isYoutubeSource,
		vimeo: isVimeoSource,
		numMaps: mapIds.length,
		uniqueMaps: uniqueMapIds.length,
		numImages: imageCounter.length,
		numVideos: videoCounter.length
	};
	return parsedItem;
}

/*
	This function is dedicated to parse the data for Series.
	It takes two parameters, the actual item data and the item id and returns an parsedItem object
	This function makes few checks the image source, video sources and their counts, number of sections,
	number of maps, number of unique maps etc. 
*/
function parseSeriesData(item, id) {
	let isArcGISSource = "0";
	let isGoogleSource = "0";
	let isFlickrSource = "0";
	let isUnsplashSource = "0";
	let isOtherSource = "0";
	let isYoutubeSource = "0";
	let isVimeoSource = "0";
	let locateBtnStatus = false;
	let geocoder = "false";
	let mapsSync = "false";
	let theme = "false";
	let templateCreated = "false";
	let templateEdited = "false";
	let sectionCount = "false";
	let legend = "false";
	let imgDisplay = "false";

	let mapIds = [];
	let count = 0;
	let uniqueMapIds = [];
	let imageCounter = [];
	let videoCounter = [];
	let itemIdentifier = id;
	let layoutId = "false";

	let videoURL = "undefined";
	let noMedia;
	let firstImageInSection = true;

	if (item.hasOwnProperty("values")) {
		if (item.values.hasOwnProperty("settings")) {
			if (item.values.settings.hasOwnProperty("layout")) {
				if (item.values.settings.layout.hasOwnProperty("id")) {
					layoutId = item.values.settings.layout.id;
				}
			}

			if (item.values.settings.hasOwnProperty("layoutOptions")) {
				legend = item.values.settings.layoutOptions.legend;
			}
			if (item.values.settings.hasOwnProperty("mapOptions")) {
				if (
					item.values.settings.mapOptions.hasOwnProperty("locateBtn")
				) {
					locateBtnStatus =
						item.values.settings.mapOptions.locateBtn.enable;
				}
				if (
					item.values.settings.mapOptions.hasOwnProperty("geocoder")
				) {
					geocoder = item.values.settings.mapOptions.geocoder.enable;
				}
				if (
					item.values.settings.mapOptions.hasOwnProperty("mapsSync")
				) {
					mapsSync = item.values.settings.mapOptions.mapsSync;
				}
			}

			if (item.values.settings.hasOwnProperty("theme")) {
				if (item.values.settings.theme.hasOwnProperty("colors")) {
					theme = item.values.settings.theme.colors.group;
				}
			}
		} 
		if (item.values.hasOwnProperty("template")) {
			if (
				item.values.template.hasOwnProperty("editedWith") &&
				item.values.template.editedWith !== undefined
			)
				templateEdited = item.values.template.editedWith;
			if (
				item.values.template.hasOwnProperty("createdWith") &&
				item.values.template.createdWith !== undefined
			)
				templateCreated = item.values.template.createdWith;
		}

		if (item.values.hasOwnProperty("story")) {
			if (item.values.story.hasOwnProperty("entries")) {
				sectionCount = item.values.story.entries.length;
				item.values.story.entries.forEach(function(items) {
					if (items.media === undefined) {
						noMedia = true;
					} else {
						if (items.hasOwnProperty("media")) {
							if (items.media.hasOwnProperty("type")) {
								if (items.media.type === "video") {
									videoCounter.push(1);
									if (items.media.hasOwnProperty("video")) {
										if (
											items.media.video.hasOwnProperty(
												"url"
											)
										) {
											videoURL = items.media.video.url;
											if (videoURL.includes("youtube")) {
												isYoutubeSource = "1";
											}
											if (videoURL.includes("vimeo")) {
												isVimeoSource = "1";
											}
										}
									}
								}
								if (items.media.type == "image") {
									imageCounter.push(1);

									if (
										items.media.image.hasOwnProperty(
											"display"
										) &&
										firstImageInSection == true
									) {
										imgDisplay = items.media.image.display;
										firstImageInSection = false;
									}
									if (
										items.media.image.hasOwnProperty("url")
									) {
										imageURL = items.media.image.url;

										if (imageURL.includes("arcgis")) {
											isArcGISSource = "1";
										}
										if (imageURL.includes("google")) {
											isGoogleSource = "1";
										}
										if (imageURL.includes("flickr")) {
											isFlickrSource = "1";
										}
										if (
											!imageURL.includes("google") &&
											!imageURL.includes("arcgis") &&
											!imageURL.includes("flickr")
										) {
											isOtherSource = "1";
										}
									}
								}

								if (items.media.type == "webmap") {
									mapIds.push(items.media.webmap.id);
								}
							}
						}
					}
				});
			}
		}
	}
	uniqueMapIds = removeDuplicates(mapIds);

	const parsedItem = {
		itemId: itemIdentifier,
		layout: layoutId,
		layoutLegend: legend,
		templateCreatedWith: templateCreated,
		templateEditedWith: templateEdited,
		numSections: sectionCount,
		themeGroup: theme,
		locateButtonStatus: locateBtnStatus,
		geocoderStatus: geocoder,
		mapSyncStatus: mapsSync,
		Arcgis: isArcGISSource,
		Google: isGoogleSource,
		Flickr: isFlickrSource,
		YouTube: isYoutubeSource,
		Vimeo: isVimeoSource,
		linkedImage: isOtherSource,
		imageDisplay: imgDisplay,
		numMaps: mapIds.length,
		uniqueMaps: uniqueMapIds.length,
		numImages: imageCounter.length,
		numVideos: videoCounter.length
	};

	return parsedItem;
}

/*
	This function removes duplicates from the given array and returns
	an unique array 
*/
function removeDuplicates(arr) {
	let unique_array = [];
	for (let i = 0; i < arr.length; i++) {
		if (unique_array.indexOf(arr[i]) == -1) {
			unique_array.push(arr[i]);
		}
	}
	return unique_array;
}

// exporting the following functions for use in other files that import them.
module.exports = {
	parseTourData,
	parseCascadeData,
	parseSeriesData,
	parseJournalData
};
