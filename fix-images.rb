require 'json'

data = """
Conor Mulhern
https://pps.whatsapp.net/v/t61.24694-24/310986362_1310320509782822_5796514826825713140_n.jpg?ccb=11-4&oh=01_AdQTpkVaBmhP4F6HcU6sM1WCDKLUFEHG8khoRn9rOlo1Og&oe=637A6561
Paul Cully
https://pps.whatsapp.net/v/t61.24694-24/56444313_430752207731449_8419198341925044224_n.jpg?ccb=11-4&oh=01_AdTEJZcQJQb1CaVHnWCosRIKqotgZwYqBj5fEaGbiLLXpQ&oe=637A601A
Callum Sally
https://pps.whatsapp.net/v/t61.24694-24/75561677_841011112995798_3714996437224406766_n.jpg?ccb=11-4&oh=01_AdSS9SpzC0dzxdv-tJDHJgGKvv4Fgb-mtS0GGeEp_8BzFg&oe=637A519D
Niall Smith
https://pps.whatsapp.net/v/t61.24694-24/302639480_1535308196937858_8983569215875832420_n.jpg?ccb=11-4&oh=01_AdRfmiJ4mu46Yr5RvKow5hRYgCrj_6qtobFohjc0uWyxGg&oe=637A4347
Alan Walsh
https://pps.whatsapp.net/v/t61.24694-24/65866141_346888639583908_1759962110525177856_n.jpg?ccb=11-4&oh=01_AdSWNTs9z7DE-ALiO9Btsl-IoZ5F5GV-u3RTOc5mB62yeg&oe=637AA5EE
James Doonan
https://pps.whatsapp.net/v/t61.24694-24/180790057_313280347074886_4874801794098292922_n.jpg?ccb=11-4&oh=01_AdQZKX_HWwFOpPrCTkA6hW5HlT-aTixMNMFU7gB9OEqaHg&oe=637A950A
Alan Kelly
https://pps.whatsapp.net/v/t61.24694-24/157756695_493917935185803_1060994127101509428_n.jpg?ccb=11-4&oh=01_AdRjB-5N3Td8eeDH_7s2z9jsIdx7NOn40Mou97rok0r6UA&oe=637AAB3F
Conor Murphy
https://pps.whatsapp.net/v/t61.24694-24/293406547_347244674265880_6728265201148922428_n.jpg?ccb=11-4&oh=01_AdRO7QBLXphO-Kz1RWwUK7OjCXswmfy-1_pvkczAtTbNWQ&oe=637A6D84
Niall Rigney
https://pps.whatsapp.net/v/t61.24694-24/56691622_2368636946689392_959988399689695232_n.jpg?ccb=11-4&oh=01_AdQq8AJt_qLErHKV_zAt807q9EdMUj1IU17otVqC3bwH1w&oe=637A3E2B
Anto Lee
https://pps.whatsapp.net/v/t61.24694-24/56153822_288546062070260_5734646960753737728_n.jpg?ccb=11-4&oh=01_AdToVbghsq1tzsnunqhBEaRMjwrpIyj2GdZfzU_CVC4ifA&oe=637A5CFE
Alan Gallagher
https://pps.whatsapp.net/v/t61.24694-24/73200500_1483776355103959_3097445800415283782_n.jpg?ccb=11-4&oh=01_AdRZW52JcJ-h88Nui4VuxtL79ZplfB2mHizNbrkDwwbjGg&oe=637A41DA
Conor Mongey
https://pps.whatsapp.net/v/t61.24694-24/56938378_469058803866579_6349686492289302528_n.jpg?ccb=11-4&oh=01_AdQ-Eh26JfsoAdYDrkuO6kDDsauvHsr9LMeaTHe_boVdWQ&oe=637A597D
"""
filename = "public/players/lucan.json"
original = JSON.parse(File.read(filename))

names_to_image = data.strip.lines.each_slice(2).map {|d| name = d[0].strip; image = d[1].strip; {name: name, image: image}}

player_data = original.dup
names_to_image.each do |d|
  index_of_player = player_data["players"].find_index{ |json| json["name"] == d[:name] }
  raise "Could not find #{d}" unless index_of_player
  original_data = player_data["players"][index_of_player]
  player_data["players"][index_of_player] = original_data.merge({"image" => d[:image]})
end
File.write(filename, player_data.to_json)
