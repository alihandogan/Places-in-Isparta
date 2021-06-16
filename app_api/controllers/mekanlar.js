const mongoose=require('mongoose');
const Mekan=mongoose.model('mekan');
const cevapOlustur = function (res,status,content) {
  res
	.status(status)
	.json(content);
};
const tumMekanlariListele= function (req, res) {

	  
	  mekan.find({},function(hata, sonuclar) {
   
		 var mekanlar = [];
		 if (hata) {
		   cevapOlustur (res, 404, hata);
		 } else {
		   sonuclar.forEach(function(sonuc) {
			   mekanlar.push({
				   ad: sonuc.ad,
				   adres: sonuc.adres,
				   puan: sonuc.puan,
				   imkanlar: sonuc.imkanlar,
				   _id: sonuc._id
			   }); 
   
		   });
		   cevapOlustur (res, 200, mekanlar);
	   }
   });
   };
const mekanlariListele= async (req, res) =>{
	//url'den enlem ve boylam parametrelerini al
	var boylam= parseFloat(req.query.boylam);
	var enlem= parseFloat(req.query.enlem);
	var maksimumMesafe=req.query.mm;
	//alınan bilgilerden nokta tanımla
	var konum = {
		type: "Point",
		coordinates: [enlem,boylam]
	};
	if (!enlem || !boylam) {
		cevapOlustur(res, 404, {"mesaj":"enlem ve boylam girmek zorunlu"});
		return;
	}
	try{
	const sonuclar=await Mekan.aggregate([
		{
			$geoNear:{
				near:konum,
				distanceField:"mesafe",
				key:"koordinatlar",
				spherical: true,
				maxDistance: maksimumMesafe,
				limit:10
			}
	}
	]);
	//dönen sonuçları tutacağımız diziyi tanımla
	//map ile sadece anasayfada yer alacak bilgileri getir
	const mekanlar = sonuclar.map(sonuc=>{
		return {
			id:sonuc._id,
			ad:sonuc.ad,
			adres:sonuc.adres,
			puan:sonuc.puan,
			imkanlar:sonuc.imkanlar,
			mesafe:sonuc.mesafe.toFixed()+'m'
		}
	});
		cevapOlustur (res, 200, mekanlar);
}catch(hata){
	cevapOlustur(res,404,hata);
}
    
}
const mekanEkle = function (req, res) {
		Mekan.create({
			ad: req.body.ad,
			adres: req.body.adres,
			imkanlar: req.body.imkanlar.split(","),
			koordinatlar: [parseFloat(req.body.enlem),parseFloat(req.body.boylam)],
			saatler: [
			{
				gunler: req.body.gunler1,
				acilis: req.body.acilis1,
				kapanis: req.body.kapanis1,
				kapali: req.body.kapali1
			},{
				gunler: req.body.gunler2,
				acilis: req.body.acilis2,
				kapanis: req.body.kapanis2,
				kapali: req.body.kapali2
			}]
		},	function(hata, mekan) {
			if (hata) {
				cevapOlustur (res, 404, hata);
			} else {
				cevapOlustur (res, 201, mekan);
			}
		});
};
const mekanGetir = function (req, res) {
  if(req.params&&req.params.mekanid){
  Mekan.findById(req.params.mekanid)
  .exec(
	  function(hata,mekan){
	  	if(!mekan){
	      cevapOlustur(res,404,{"durum":"mekanid bulunamadı"});
	      return;
		}
		else if(hata){
		  cevapOlustur(res,404,hata);
		  return;
		}
	  cevapOlustur(res,200,mekan);
	  }
	);
}
else
  cevapOlustur(res,404,{"durum":"istekte mekanid yok"});
}
const mekanGuncelle= function (req, res) {
  if (!req.params.mekanid) {
  	cevapOlustur(res, 404, {"mesaj": "Bulunamadı. mekanid gerekli"});
  	return;
  }
  	Mekan
  	.findById(req.params.mekanid)
  	//- işareti yorumlar ve puan dışında her şeyi almamızı söyler
  	.select('-yorumlar -puan')
  	.exec(
  	  function(hata, gelenMekan) {
  	  	if (!gelenMekan) {
  	  	   cevapOlustur(res, 404, {"mesaj": "mekanid bulunamadı"});
  	  	   return;
  	  	} else if (hata) {
  	       cevapOlustur(res, 400, hata);
  	       return;
  	  	}
  	  	gelenMekan.ad = req.body.ad;
  	  	gelenMekan.adres = req.body.adres;
  	  	gelenMekan.imkanlar = req.body.imkanlar.split(",");
  	  	gelenMekan.koordinatlar = [parseFloat(req.body.enlem),parseFloat(req.body.boylam)];
  	  	gelenMekan.saatler = [{
  	  	  gunler: req.body.gunler1,
  	  	  acilis: req.body.acilis1,
  	  	  kapanis: req.body.kapanis1,
  	  	  kapali: req.body.kapali1,
  	  	}, {
  	  	  gunler: req.body.gunler2,
  	  	  acilis: req.body.acilis2,
  	  	  kapanis: req.body.kapanis2,
  	  	  kapali: req.body.kapali2,
  	  	}];
  	  	gelenMekan.save(function(hata, mekan) {
  	  	  if (hata) {
  	  	  	 cevapOlustur(res, 404,hata);
  	  	  } else {
  	  	  	 cevapOlustur(res, 200, mekan);
  	  	  }
  	  	});
  	  });
 }


const mekanSil = function (req, res) {
			
			var mekanid = req.params.mekanid;
			if (mekanid) {
				Mekan
				.findByIdAndRemove(mekanid)
				.exec(
					function(hata, gelenMekan) {
						if (hata) {
							cevapOlustur(res, 404, hata);
							return;
						}
							cevapOlustur(res, 204, null);
						}
					 	);
					} else {
						cevapOlustur(res, 404, {"mesaj": "mekanid bulunamadı"});
					}
			};


module.exports = {
	mekanlariListele,
	mekanEkle,
	mekanGetir,
	mekanGuncelle,
	mekanSil,
};